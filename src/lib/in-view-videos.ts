export abstract class InViewVideos {
  private static readonly visibleRatio = 0.4;

  static start(): () => void {
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("[data-in-view-video]"));
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      videos.forEach((video) => {
        video.controls = true;
        video.preload = "metadata";
      });
      return () => {};
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= InViewVideos.visibleRatio) {
            video.play().catch(() => {
              video.controls = true;
            });
            return;
          }
          video.pause();
        });
      },
      { threshold: [0, InViewVideos.visibleRatio] },
    );
    videos.forEach((video) => {
      observer.observe(video);
    });
    return () => {
      observer.disconnect();
    };
  }
}
