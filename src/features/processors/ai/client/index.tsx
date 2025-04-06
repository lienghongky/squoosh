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

    const newOptions: AIOptions = {
      task: 'rain-removal',
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
            <Select
              name="resizeMethod"
              // value={options.method}
              onChange={this.onChange}
            >
              <option value="lanczos3">Rain Streak Removal</option>
              <option value="mitchell">Rain Drop Removal</option>
              <option value="triangle">Noise Removal</option>
              <option value="catrom">Low Light Enhancement</option>
            </Select>
          </label>
        </Expander>
      </form>
    );
  }
}
