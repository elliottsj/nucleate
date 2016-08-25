// @flow

import { match } from 'react-router';
import pify from 'pify';

export default pify(match, { multiArgs: true });
