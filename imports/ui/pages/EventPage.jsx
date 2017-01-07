import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import handleMethodsCallbacks from '../../helpers/handleMethodsCallbacks';
import { OrderMenuPicker } from '../components/MenuPicker';
import { OrderInfoContainer } from '../components/OrderInfo';
import Events from '../../api/events/collection';

const propTypes = {
  eventId: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  date: PropTypes.string,
  status: PropTypes.string,
  orderId: PropTypes.string,
  isParticipant: PropTypes.bool,
  eventLoading: PropTypes.bool,
};

const defaultProps = {
  orderedItems: [],
};

class EventPage extends Component {
  constructor(props) {
    super(props);
    this.menu = [];
  }

  joinEvent = () => {
    Meteor.call('events.joinEvent', this.props.eventId, handleMethodsCallbacks);
  };

  leaveEvent = () => {
    Meteor.call('events.leaveEvent', this.props.eventId, handleMethodsCallbacks);
  };

  orderItems = () => {
    const menu = this.menu;
    const eventId = this.props.eventId;
    const userId = Meteor.userId();

    Meteor.call('orders.insert', { eventId, menu, userId }, handleMethodsCallbacks);
  };
  render() {
    if (this.props.eventLoading) {
      return <div>Loading event...</div>;
    }

    return (<div className="event-page">
      <ul className="event-page__info">
        <li>Name: { this.props.name }({ this.props.status })</li>
        <li>Title: { this.props.title }</li>
        <li>Date: { this.props.date }</li>
        <li>
          { this.props.isParticipant ?
            <button type="button" onClick={this.leaveEvent}>Leave</button> :
            <button type="button" onClick={this.joinEvent}>Join</button> }
        </li>
      </ul>
      <div className="event-page__menu">
        { this.props.orderId ?
          <OrderInfoContainer
            id={this.props.orderId}
          /> :
          <OrderMenuPicker
            id={this.props.eventId}
            getMenuList={(list) => { this.menu = [...list]; }}
          /> }
      </div>
      <button type="button" onClick={this.orderItems}>Order items</button>
    </div>);
  }
}

EventPage.propTypes = propTypes;
EventPage.defaultProps = defaultProps;

const EventPageContainer = createContainer(({ eventId }) => {
  const handleEvent = Meteor.subscribe('Event', eventId);

  const event = Events.findOne() || {};
  const participant = _.findWhere(event.participants, { _id: Meteor.userId() });

  return {
    eventId,
    orderId: participant ? participant.order : null,
    ...event,
    isParticipant: !!participant,
    eventLoading: !handleEvent.ready(),
  };
}, EventPage);

export default EventPageContainer;
