import React, { Component, PropTypes } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { resolveComponentsQueries } from '../query';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function query(queries) {
  return function wrapWithQuery(WrappedComponent) {
    class Query extends Component {
      componentWillMount() {
        const { mergeResolvedQueries } = this.context;
        const { routes } = this.props;
        resolveComponentsQueries(
          routes[0],
          routes.map(r => r.component)
        ).then((resolvedQueries) => {
          mergeResolvedQueries(resolvedQueries);
        });
      }

      render() {
        const props = this.props;
        const resolvedQuery = this.context.resolvedQueries.get(Query);
        if (!resolvedQuery) {
          return <div>Loading...</div>;
        }
        return <WrappedComponent {...props} {...resolvedQuery} />;
      }
    }
    Query.displayName = `Query(${getDisplayName(WrappedComponent)})`;
    Query.contextTypes = {
      resolvedQueries: PropTypes.instanceOf(Map).isRequired,
      mergeResolvedQueries: PropTypes.func.isRequired,
    };
    Query.propTypes = {
      routes: PropTypes.array.isRequired,
    };
    Query.nucleateQuery = queries;

    hoistStatics(Query, WrappedComponent);

    return Query;
  };
}
