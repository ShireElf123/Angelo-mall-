// The CSS contract suite scans the exact ordered modules used by index.css.
import css01 from './styles/01-foundation.css?raw';
import css02 from './styles/02-shell.css?raw';
import css03 from './styles/03-home-and-directory.css?raw';
import css04 from './styles/04-shop-and-chat.css?raw';
import css05 from './styles/05-customer-checkout.css?raw';
import css06 from './styles/06-operational-workspaces.css?raw';
import css07 from './styles/07-shop-identity-and-chat-controls.css?raw';
import css08 from './styles/08-interaction-tokens.css?raw';
import css09 from './styles/09-native-app-shell.css?raw';
import css10 from './styles/10-shop-launcher.css?raw';
import css11 from './styles/11-responsive-finishing.css?raw';

export default [
  css01,
  css02,
  css03,
  css04,
  css05,
  css06,
  css07,
  css08,
  css09,
  css10,
  css11,
].join('\n');
