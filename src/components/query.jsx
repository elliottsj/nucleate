import React, { Component, PropTypes } from 'react';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function query(queries) {
  return function wrapWithQuery(WrappedComponent) {
    class Query extends Component {
      render() {
        const props = this.props;
        const resolvedQuery = this.context.resolvedQueries.get(Query);
        return <WrappedComponent {...props} {...resolvedQuery} />;
      }
    }
    Query.displayName = `Query(${getDisplayName(WrappedComponent)})`;
    Query.contextTypes = {
      resolvedQueries: PropTypes.instanceOf(Map).isRequired,
    };
    Query.nucleateQuery = queries;
    return Query;
  };
}
