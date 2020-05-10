import App from './app/App';
import UI from './ui';

const main = async (): Promise<void> => {
    UI.Main.init();

    App.initEventHandlers();
    App.init();
}

main();