import App from './app/App';

const main = async (): Promise<void> => {
    const app: App = new App();

    app.initEventHandlers();
    app.init();
}

main();