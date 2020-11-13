import { 
    Text, 
    EventHandler 
} from '../../ui';

export default abstract class Scene {
    public show(): void {  }

    public hide(): void {  }

    public static attachText(text: Text): void {
        EventHandler.attachResizeReRenderEvent(0, text.id, text.onResize.bind(text));
        text.onResize();
    }

    public static detachText(text: Text): void {
        EventHandler.detachResizeReRenderEventMap(0, text.id);
        text.clear();
    }
}
