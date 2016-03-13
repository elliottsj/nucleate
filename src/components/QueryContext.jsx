import { Component, PropTypes } from 'react';

export default class QueryContext extends Component {
  static propTypes = {
    children: PropTypes.node,
    resolvedQueries: PropTypes.object,
  };

  static childContextTypes = {
    resolvedQueries: PropTypes.instanceOf(Map).isRequired,
    mergeResolvedQueries: PropTypes.func.isRequired,
  };

  getChildContext() {
    return {
      resolvedQueries: this.state.resolvedQueries,
      mergeResolvedQueries: (resolvedQueries) => {
        this.setState({
          resolvedQueries: new Map([...this.props.resolvedQueries, ...resolvedQueries]),
        });
      },
    };
  }

  componentWillMount() {
    const { resolvedQueries } = this.props;
    this.setState({ resolvedQueries });
  }

  render() {
    return this.props.children;
  }
}
