import React, { PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import handleMethodsCallbacks from '../../helpers/handleMethodsCallbacks';
import { OrderMenuPicker } from '../components/MenuPicker';
import { OrderInfoContainer } from '../components/OrderInfo';
import Events from '../../api/events/collection';
import Controls from '../../ui/components/Controls';

const propTypes = {
  eventId: PropTypes.string,
  creator: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  date: PropTypes.string,
  menu: PropTypes.arrayOf(String),
  status: PropTypes.string,
  orderId: PropTypes.string,
  isParticipant: PropTypes.bool,
  eventLoading: PropTypes.bool,
};

const defaultProps = {
  orderedItems: [],
};

const EventPage = (props) => {
  const editable = props.creator === Meteor.userId();

  function updateData(obj) {
    Meteor.call('events.update',
      { id: props.eventId, ...obj },
      handleMethodsCallbacks,
    );
  }

  function joinEvent() {
    Meteor.call('events.joinEvent', props.eventId, handleMethodsCallbacks);
  }

  function leaveEvent() {
    Meteor.call('events.leaveEvent', props.eventId, handleMethodsCallbacks);
  }

  function orderItems() {
    const menu = this.menu || [];
    const eventId = props.eventId;

    Meteor.call('orders.insert', { eventId, menu }, handleMethodsCallbacks);
  }

  function deleteOrder() {
    const eventId = props.eventId;

    Meteor.call('events.removeOrdering', eventId, handleMethodsCallbacks);
  }

  function addMenuItems(items) {
    const eventId = props.eventId;

    Meteor.call('events.addMenuItems', { id: eventId, items });
  }

  function changeStatus(event) {
    Meteor.call('events.updateStatus', {
      id: props.eventId,
      status: event.target.value,
    });
  }

  function enterData(func) {
    return (event) => {
      if (event.key.toLowerCase() === 'enter') {
        func();
      }

      return true;
    };
  }

  if (props.eventLoading) {
    return <div>Loading event...</div>;
  }

  return (<div className="content page-content">
    <div className="mdl-grid">
      <div className="mdl-cell mdl-cell--8-col">
        <h1>{ props.name }
          { editable && <div className="mdl-textfield mdl-js-textfield mdl-textfield--expandable">
            <label className="mdl-button mdl-js-button mdl-button--icon" htmlFor={props.name}>
              <i className="material-icons">edit</i>
            </label>
            <div className="mdl-textfield__expandable-holder">
              <input
                type="text"
                ref={(name) => {
                  this.eventName = name;
                }}
                id={props.name}
                onKeyPress={enterData(() => {
                  updateData({ name: this.eventName.value });
                  this.eventName.value = '';
                })}
                className="mdl-textfield__input"
              />
              <label className="mdl-textfield__label" htmlFor={props.name}>New name</label>
            </div>
          </div> }
        </h1>
      </div>
      <div className="mdl-layout-spacer" />
      <div className="controls">
        { props.isParticipant ?
          <button
            type="button"
            className=""
            onClick={leaveEvent}
          >Leave</button> :
          <button
            type="button"
            className=""
            onClick={joinEvent}
          >Join</button> }
        { editable ? <select onChange={changeStatus}>
          <option
            value="ordering"
          >ordering</option>
          <option
            value="ordered"
          >ordered</option>
          <option
            value="delivering"
          >delivering</option>
          <option
            value="delivered"
          >delivered</option>
        </select> : props.status }
        <Controls
          updateData={(date) => { updateData({ date }); }}
          eventId={props.eventId}
          controls={{ menu: true, date: true }}
          menu={props.menu}
          addMenuItems={(items) => { addMenuItems(items); }}
        />
      </div>
    </div>
    <div className="mdl-grid">
      <div className="mdl-cell mdl-cell--5-col">
        <span className="as-b">{ props.title }
          { editable && <div className="mdl-textfield mdl-js-textfield mdl-textfield--expandable">
            <label className="mdl-button mdl-js-button mdl-button--icon" htmlFor={props.title}>
              <i className="material-icons">edit</i>
            </label>
            <div className="mdl-textfield__expandable-holder">
              <input
                type="text"
                ref={(name) => {
                  this.title = name;
                }}
                id={props.title}
                onKeyPress={enterData(() => {
                  updateData({ title: this.title.value });
                  this.title.value = '';
                })}
                className="mdl-textfield__input"
              />
              <label className="mdl-textfield__label" htmlFor={props.title}>New title</label>
            </div>
          </div> }
        </span>
      </div>
      <div className="mdl-layout-spacer" />
      <h5 className="as-b headline">{ props.date }</h5>
    </div>
    { props.orderId ?
      <div className="mdl-grid">
        <div className="mdl-cell mdl-cell--5-col">
          <h4>Order</h4>
        </div>
        <div className="mdl-layout-spacer" />
        <button
          className="as-c mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
          type="button"
          onClick={deleteOrder}
        >Delete ordering</button>
      </div> : <div className="mdl-grid">
        <div className="mdl-cell mdl-cell--6-col">
          <h4>Menu</h4>
        </div>
        <div className="mdl-layout-spacer" />
        <button
          className="as-c mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
          type="button"
          onClick={orderItems}
        >Order items</button>
      </div> }
    { props.orderId ?
      <OrderInfoContainer
        id={props.orderId}
      /> :
      <OrderMenuPicker
        id={props.eventId}
        key={props.menu}
        getMenuList={(list) => { this.menu = [...list]; }}
      /> }
  </div>);
};

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
