import { FlexPluginBase } from '@flexsdk/runtime';
import type { PluginDefinitionsPayload, PluginEventEnvelope, PluginLoadContext } from '@flexsdk/types';

const PLUGIN_UUID = '@ENIAC-Tech/flex-plugin-test-c';
const UNIT_TYPE_ID = `${PLUGIN_UUID}.example-unit`;

export default class FlexPluginTestCPlugin extends FlexPluginBase {
  async getDefinitions(): Promise<PluginDefinitionsPayload> {
    return {
      libraries: [this.createDefaultLibrary({ name: 'Flex Plugin Test C' })],
      units: [
        this.createUnitTemplate({
          unitId: 'example-unit',
          typeId: UNIT_TYPE_ID,
          name: 'Example Unit',
          categoryId: 'plugin',
          icon: 'mdi-puzzle',
          hasFunctionEditor: true,
          hasAppearanceEditor: true,
          hasView: false,
          defaultData: { message: 'Hello from plugin!' }
        })
      ],
      revision: '1.0.0'
    };
  }

  async onLoad(ctx: PluginLoadContext): Promise<void> {
    await super.onLoad(ctx);
    this.logger.info('Plugin loaded');

    this.registerDependencyApi('getDependencyApiProbe', async (input?: string) => {
      return {
        plugin: 'c',
        input: input ?? 'from-c',
        message: 'hello-from-c'
      };
    });

    this.registerRendererRpc('getMessage', async () => {
      return ctx.hostApi.store.get('message', 'Hello from plugin!');
    });

    this.registerRendererRpc('setMessage', async (message: string) => {
      await ctx.hostApi.store.set('message', message);
      return { success: true };
    });

    await this.onRawUnitEvent(UNIT_TYPE_ID, async (payload) => {
      if (payload.rawEvent !== 'pressed') return;
      this.logger.info('Key pressed', { payload });
    });

    await this.on(
      'device.connection.changed',
      (event: PluginEventEnvelope) => {
        this.logger.info('Device connection changed', event.payload);
      },
      { snapshot: true }
    );
  }
}
