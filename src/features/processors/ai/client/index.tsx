import { h, Component } from 'preact';
import { Options as AIOptions } from '../shared/meta';
import * as style from 'client/lazy-app/Compress/Options/style.css';
import {
  inputFieldValueAsNumber,
  konami,
  preventDefault,
} from 'client/lazy-app/util';
import Expander from 'client/lazy-app/Compress/Options/Expander';
import Select from 'client/lazy-app/Compress/Options/Select';
import Range from 'client/lazy-app/Compress/Options/Range';

const konamiPromise = konami();

interface Props {
  options: AIOptions;
  onChange(newOptions: AIOptions): void;
}

interface State {
  extendedSettings: boolean;
}

export class Options extends Component<Props, State> {
  state: State = { extendedSettings: false };

  componentDidMount() {
    konamiPromise.then(() => {
      this.setState({ extendedSettings: true });
    });
  }

  onChange = (event: Event) => {
    const form = (event.currentTarget as HTMLInputElement).closest(
      'form',
    ) as HTMLFormElement;
    const { options } = this.props;
    const formData = new FormData(form);

    const newOptions: AIOptions = {
      task: formData.get('task') as string,
      mode: 0,
      intensity: 200,
    };
    this.props.onChange(newOptions);
  };

  render({ options }: Props, { extendedSettings }: State) {
    return (
      <form class={style.optionsSection} onSubmit={preventDefault}>
        <Expander>
          <label class={style.optionTextFirst}>
            Method:
            <Select name="task" value={options.task} onChange={this.onChange}>
              <option value="">None</option>
              <option value="rainstreak">Rain Streak Removal</option>
              <option value="raindrop">Rain Drop Removal</option>
              <option value="lolv1">Low Light v1</option>
              <option value="lolv2">Low Light v2</option>
            </Select>
          </label>
        </Expander>
      </form>
    );
  }
}
