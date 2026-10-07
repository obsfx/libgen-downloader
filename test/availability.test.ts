import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { AvailabilityMonitor } from "../src/api/availability/availability-monitor";
import { MirrorHealthRegistry } from "../src/api/availability/mirror-health-registry";
import type { AvailabilityStatus, BackoffPolicy } from "../src/api/availability/types";
import { backoffDelay } from "../src/api/availability/utils/waiting";
import { classifyFailure, failureKindFromStatus } from "../src/api/availability/utils/failures";
import type { Mirror } from "../src/api/data/types";
import { DownloadService } from "../src/api/download/download-service";
import { DownloadSourceFactory } from "../src/api/download/download-source-factory";
import { DownloadUnavailableError, HttpStatusError, TransientDownloadError } from "../src/errors";
import { MemorySelectorStore } from "./support/memory-selector-store";
import { AppServices } from "../src/api/services/app-services";
import { FakeClock } from "./support/fake-clock";
import { FakeHealthCheck } from "./support/fake-health-check";
import { UNHEALTHY } from "./support/helpers";

const POLICY: BackoffPolicy = { initialMs: 15_000, maxMs: 300_000, factor: 2, jitterRatio: 0 };
const OUTAGE = { kind: "backend-overloaded" as const, reason: "Could not connect to the database" };
const CHECK_TIMEOUT_MS = 1000;

const createMonitor = () => {
  const clock = new FakeClock();
  const registry = new MirrorHealthRegistry(POLICY, clock);
  const monitor = new AvailabilityMonitor(registry, POLICY, clock, CHECK_TIMEOUT_MS);
  const statuses: AvailabilityStatus[] = [];
  monitor.subscribe((status) => statuses.push(status));
  return { clock, registry, monitor, statuses };
};

afterEach(() => {
  mock.restore();
});

describe("backoffDelay", () => {
  it("doubles from the initial delay up to the cap", () => {
    const delays = [0, 1, 2, 3, 4, 5, 6].map((attempt) => backoffDelay(POLICY, attempt));
    expect(delays).toEqual([15_000, 30_000, 60_000, 120_000, 240_000, 300_000, 300_000]);
  });

  it("applies jitter without exceeding the cap", () => {
    const jittered = { ...POLICY, jitterRatio: 0.2 };
    expect(backoffDelay(jittered, 0, () => 1)).toBe(18_000);
    expect(backoffDelay(jittered, 0, () => 0)).toBe(12_000);
    expect(backoffDelay(jittered, 10, () => 1)).toBe(300_000);
  });
});

describe("failure classification", () => {
  it("separates outages from books that are not available", () => {
    expect(classifyFailure(new DownloadUnavailableError("no link"))).toBe("not-available");
    expect(classifyFailure(new TransientDownloadError("db", "backend-overloaded"))).toBe(
      "backend-overloaded"
    );
    expect(classifyFailure(new HttpStatusError(429, "u"))).toBe("rate-limited");
    expect(classifyFailure(new HttpStatusError(502, "u"))).toBe("server-error");
    expect(classifyFailure(new HttpStatusError(404, "u"))).toBe("not-available");
    expect(
      classifyFailure(Object.assign(new Error("Unable to connect"), { code: "ConnectionRefused" }))
    ).toBe("unreachable");
    expect(classifyFailure(new DOMException("timed out", "TimeoutError"))).toBe("unreachable");
    expect(failureKindFromStatus(500, "Could not connect to the database 3306")).toBe(
      "backend-overloaded"
    );
  });
});

describe("MirrorHealthRegistry", () => {
  it("cools a failing mirror down and lets it back in, behind healthy mirrors", async () => {
    const clock = new FakeClock();
    const registry = new MirrorHealthRegistry(POLICY, clock);
    const sources = [{ name: "a" }, { name: "b" }];

    registry.recordFailure("a", OUTAGE);
    expect(registry.order(sources)).toEqual({
      usable: [{ name: "b" }],
      coolingDown: [{ name: "a" }],
    });

    await clock.advance(15_000);
    expect(registry.order(sources).usable.map(({ name }) => name)).toEqual(["b", "a"]);
  });

  it("ignores books that are not available and puts recovered mirrors first", () => {
    const registry = new MirrorHealthRegistry(POLICY, new FakeClock());
    registry.recordFailure("a", { kind: "not-available", reason: "no link" });
    expect(registry.get("a").state).toBe("healthy");

    registry.recordFailure("b", OUTAGE);
    registry.markRecovered("b");
    expect(registry.order([{ name: "a" }, { name: "b" }]).usable.map(({ name }) => name)).toEqual([
      "b",
      "a",
    ]);

    registry.recordSuccess("b");
    expect(registry.get("b")).toMatchObject({ state: "healthy", consecutiveFailures: 0 });
  });
});

describe("AvailabilityMonitor", () => {
  it("waits with backoff and resolves when a probe turns healthy", async () => {
    const { clock, registry, monitor, statuses } = createMonitor();
    const probe = new FakeHealthCheck("libgen.bz", [UNHEALTHY, { healthy: true }]);

    const outcome = monitor.waitForRecovery({
      checks: [probe],
      outage: OUTAGE,
      signal: new AbortController().signal,
    });
    expect(monitor.currentStatus()).toMatchObject({
      state: "waiting",
      nextCheckAt: 15_000,
      checks: 0,
    });

    await clock.advance(15_000);
    expect(probe.calls).toBe(1);
    expect(monitor.currentStatus()).toMatchObject({
      state: "waiting",
      nextCheckAt: 45_000,
      checks: 1,
    });

    await clock.advance(30_000);
    await expect(outcome).resolves.toEqual({ recovered: true, sources: ["libgen.bz"] });
    expect(registry.get("libgen.bz").state).toBe("trial");
    expect(statuses.map(({ state }) => state)).toEqual([
      "waiting",
      "checking",
      "waiting",
      "checking",
      "available",
    ]);
  });

  it("shares one recovery loop between concurrent waiters", async () => {
    const { clock, monitor } = createMonitor();
    const probe = new FakeHealthCheck("libgen.li", [{ healthy: true }]);
    const request = { checks: [probe], outage: OUTAGE };

    const first = monitor.waitForRecovery({ ...request, signal: new AbortController().signal });
    const second = monitor.waitForRecovery({ ...request, signal: new AbortController().signal });
    await clock.advance(15_000);

    await expect(Promise.all([first, second])).resolves.toEqual([
      { recovered: true, sources: ["libgen.li"] },
      { recovered: true, sources: ["libgen.li"] },
    ]);
    expect(probe.calls).toBe(1);
  });

  it("lets one waiter stop waiting and ends the loop when nobody waits", async () => {
    const { clock, monitor } = createMonitor();
    const probe = new FakeHealthCheck("libgen.la", [UNHEALTHY, { healthy: true }]);
    const leaving = new AbortController();
    const staying = new AbortController();

    const left = monitor.waitForRecovery({
      checks: [probe],
      outage: OUTAGE,
      signal: leaving.signal,
    });
    const stayed = monitor.waitForRecovery({
      checks: [probe],
      outage: OUTAGE,
      signal: staying.signal,
    });
    leaving.abort();
    await expect(left).resolves.toEqual({ recovered: false, reason: "cancelled" });

    await clock.advance(15_000);
    await clock.advance(30_000);
    await expect(stayed).resolves.toEqual({ recovered: true, sources: ["libgen.la"] });

    const lastWaiter = new AbortController();
    const abandoned = monitor.waitForRecovery({
      checks: [new FakeHealthCheck("libgen.gl", [UNHEALTHY])],
      outage: OUTAGE,
      signal: lastWaiter.signal,
    });
    lastWaiter.abort();
    await expect(abandoned).resolves.toEqual({ recovered: false, reason: "cancelled" });
    await clock.advance(0);
    expect(clock.pendingSleepers()).toBe(0);
    expect(monitor.currentStatus()).toEqual({ state: "available" });
  });

  it("gives up at the deadline", async () => {
    const { clock, monitor } = createMonitor();
    const probe = new FakeHealthCheck("libgen.vg", [UNHEALTHY]);

    const outcome = monitor.waitForRecovery({
      checks: [probe],
      outage: OUTAGE,
      signal: new AbortController().signal,
      deadline: 20_000,
    });
    await clock.advance(15_000);
    expect(monitor.currentStatus()).toMatchObject({ state: "waiting", deadline: 20_000 });
    await clock.advance(5000);

    await expect(outcome).resolves.toEqual({ recovered: false, reason: "timed-out" });
    expect(probe.calls).toBe(1);
    await clock.advance(0);
    expect(clock.pendingSleepers()).toBe(0);
    expect(monitor.currentStatus()).toEqual({ state: "available" });
  });

  it("checks right away when asked", async () => {
    const { monitor } = createMonitor();
    const probe = new FakeHealthCheck("libgen.li", [{ healthy: true }]);

    const outcome = monitor.waitForRecovery({
      checks: [probe],
      outage: OUTAGE,
      signal: new AbortController().signal,
    });
    monitor.checkNow();

    await expect(outcome).resolves.toEqual({ recovered: true, sources: ["libgen.li"] });
  });
});

describe("DownloadService with mirror health", () => {
  const DATABASE_ERROR_PAGE =
    '<div class="alert alert-danger">Could not connect to the database 3306</div>';
  const mirrors: Mirror[] = [
    { src: "https://libgen-a.example/", type: "libgen-plus" },
    { src: "https://libgen-b.example/", type: "libgen-plus" },
  ];

  const createService = (services: AppServices) => {
    return new DownloadService(
      new DownloadSourceFactory(services).createSources(mirrors),
      { attemptCount: 1, delayMs: 0, timeoutMs: 5000 },
      services.mirrorHealth
    );
  };

  it("reports a waitable outage and skips cooling-down mirrors on the next attempt", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
      Object.assign(async () => new Response(DATABASE_ERROR_PAGE, { status: 500 }), {
        preconnect() {},
      })
    );
    const services = new AppServices({
      selectorStore: new MemorySelectorStore(),
      crossEncoder: false,
      clock: new FakeClock(),
    });

    const first = await createService(services).open("0123456789abcdef0123456789abcdef");
    expect(first).toMatchObject({ opened: false, waitable: true });
    if (!first.opened) {
      expect(first.failures.map(({ kind }) => kind)).toEqual([
        "backend-overloaded",
        "backend-overloaded",
      ]);
    }
    const requestsAfterFirstAttempt = fetchMock.mock.calls.length;

    const second = await createService(services).open("0123456789abcdef0123456789abcdef");
    expect(fetchMock.mock.calls.length).toBe(requestsAfterFirstAttempt);
    expect(second).toMatchObject({ opened: false, waitable: true });
    if (!second.opened) {
      expect(second.failures[0]?.reason).toStartWith("cooling down after:");
    }
  });

  it("does not treat books missing from every mirror as an outage", async () => {
    spyOn(globalThis, "fetch").mockImplementation(
      Object.assign(async () => new Response("<main>No downloads here</main>"), {
        preconnect() {},
      })
    );
    const services = new AppServices({
      selectorStore: new MemorySelectorStore(),
      crossEncoder: false,
      clock: new FakeClock(),
    });

    const outcome = await createService(services).open("0123456789abcdef0123456789abcdef");

    expect(outcome).toMatchObject({ opened: false, waitable: false });
    expect(services.mirrorHealth.snapshot()).toEqual([]);
  });
});
