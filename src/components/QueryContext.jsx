import { Component, PropTypes } from 'react';

export default class QueryContext extends Component {
  static propTypes = {
    children: PropTypes.node,
    resolvedQueries: PropTypes.object,
  };

  static childContextTypes = {
    resolvedQueries: PropTypes.instanceOf(Map).isRequired,
  };

  getChildContext() {
    return { resolvedQueries: this.props.resolvedQueries };
  }

  render() {
    return this.props.children;
  }
}
