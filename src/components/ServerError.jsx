import React, { Component, PropTypes } from 'react';

export default class ServerError extends Component {
  static propTypes = {
    location: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  componentDidMount() {
    const { router } = this.context;
    const { location } = this.props;
    if (location.query.destination) {
      router.push(location.query.destination);
    }
  }

  render() {
    const { location } = this.props;

    return (
      <div>
        <h3>Nucleate server error</h3>
        {location.query.destination ? (
          <p>Redirected to <em>{location.query.destination}</em>; check the console for errors</p>
        ) : (
          <p>No destination specified</p>
        )}
      </div>
    );
  }
}
