import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import MenuPickerFilter from '../filters/MenuPickerFilter';
import Menu from '../../../api/menu/collection';

const propTypes = {
  items: PropTypes.arrayOf(Object),
  getMenuList: PropTypes.func,
  withCounters: PropTypes.bool,
  isLoadingAvailable: PropTypes.bool,
  selectedItems: PropTypes.instanceOf(Map),
  menuLoading: PropTypes.bool,
};

const defaultProps = {
  getMenuList: () => {},
  items: [],
  selectedItems: new Map(),
};

const RD = new ReactiveDict();
RD.set('count', 10);

class MenuPicker extends Component {
  constructor(props) {
    super(props);
    this.menu = this.props.selectedItems;
    this.state = {
      filteredList: null,
    };
  }

  getMenuItems = () => {
    let filteredData;

    if (!this.state.filteredList) {
      filteredData = this.props.items;
    } else {
      filteredData = this.state.filteredList;
    }

    return filteredData.map(
      ({ _id: id, ...itemInfo }) => (<tr key={id} className="menu__item">
        <td>
          <label className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" htmlFor={id}>
            <input
              defaultChecked={this.props.selectedItems.has(id)}
              onChange={() => { this.addRemoveItem(id); }}
              type="checkbox"
              id={id}
              className="mdl-checkbox__input"
            />
          </label>
        </td>
        <td className="menu__name">{ itemInfo.name }.</td>
        <td className="menu__description">{ itemInfo.description }</td>
        <td className="menu__mass">{ itemInfo.mass }</td>
        <td className="menu__price">{ itemInfo.price }</td>
        { this.props.withCounters && <td><input
          type="number"
          className="menu__counter"
          ref={(val) => { this[id] = val; }}
          defaultValue={this.props.selectedItems.get(id) || 1}
          min="1"
          onChange={() => { this.changeCounter(id); }}
          max="10"
        /></td> }
      </tr>));
  };

  filterItems = ({ name = '', gte = 0, lte = Number.POSITIVE_INFINITY }) => {
    const filteredList = this.props.items.filter(
      item =>
        item.name.includes(name) &&
        item.price >= gte &&
        item.price <= lte,
    );

    this.setState({
      filteredList,
    });
  };

  changeCounter = (id) => {
    if (this.menu.has(id)) {
      this.menu.delete(id);
      this.menu.set(id, this[id] ? this[id].value : 1);

      if (this.props.withCounters) {
        const list = [];

        _.map([...this.menu], ([key, value]) => {
          list.push({ _id: key, count: Number(value) });
        });

        this.props.getMenuList(list);
      } else {
        this.props.getMenuList([...this.menu.keys()]);
      }
    }
  };

  addRemoveItem = (id) => {
    if (this.menu.has(id)) {
      this.menu.delete(id);
    } else {
      this.menu.set(id, this[id] ? this[id].value : 1);
    }

    if (this.props.withCounters) {
      const list = [];

      _.map([...this.menu], ([key, value]) => {
        list.push({ _id: key, count: Number(value) });
      });

      this.props.getMenuList(list);
    } else {
      this.props.getMenuList([...this.menu.keys()]);
    }
  };

  scrollBottom = (event) => {
    if (this.props.isLoadingAvailable) {
      const scrollPosition = event.target.scrollTop;
      const maxScrollHeight = event.target.scrollHeight - event.target.offsetHeight;
      if (scrollPosition >= maxScrollHeight) {
        RD.set('count', RD.get('count') + 10);
      }
    }
  };

  render() {
    if (this.props.menuLoading) {
      return <div className="spinner mdl-spinner mdl-js-spinner is-active" />;
    }

    if (!this.props.items.length) {
      return <div className="empty-list" />;
    }

    return (<div className="m-auto">
      <MenuPickerFilter changeCallback={(filter) => { this.filterItems(filter); }} />
      <div className="mdl-grid">
        <div className="table-container" onScroll={this.scrollBottom}>
          <table className="table mdl-data-table mdl-js-data-table mdl-shadow--2dp">
            <thead>
              <tr>
                <th>Pick</th>
                <th className="mdl-data-table__cell--non-numeric">Name</th>
                <th>Description</th>
                <th>Weight</th>
                <th>Price</th>
                { this.props.withCounters && <th>Count</th> }
              </tr>
            </thead>
            <tbody>
              { this.getMenuItems() }
            </tbody>
          </table>
        </div>
      </div>
    </div>);
  }
}

MenuPicker.propTypes = propTypes;
MenuPicker.defaultProps = defaultProps;

const OrderMenuPicker =
  createContainer(({ defaultValue = [], showItems = [], id, getMenuList }) => {
    const handleMenu = Meteor.subscribe('EventMenu', id);
    const itemsMap = new Map();

    _.each(defaultValue, ((value) => {
      if (_.isObject(value)) {
        itemsMap.set(..._.values(value));
      } else {
        itemsMap.set(value, 1);
      }
    }));

    return {
      items: Menu.find({ _id: { $in: showItems } }).fetch(),
      selectedItems: itemsMap,
      withCounters: true,
      getMenuList,
      menuLoading: !handleMenu.ready(),
    };
  }, MenuPicker);

const EventMenuPicker = createContainer(({ eventId, hideItems, getMenuList }) => {
  const handleMenu = Meteor.subscribe('GroupMenuForEvent', eventId);

  return {
    items: Menu.find({ _id: { $nin: hideItems } }).fetch(),
    withCounters: false,
    getMenuList,
    menuLoading: !handleMenu.ready(),
  };
}, MenuPicker);

const GroupMenuPicker = createContainer(({ groupId, getMenuList, showItems = [] }) => {
  const handleMenu = Meteor.subscribe('GroupMenu', groupId);

  return {
    items: Menu.find({ _id: { $in: showItems } }).fetch(),
    withCounters: false,
    getMenuList,
    menuLoading: !handleMenu.ready(),
  };
}, MenuPicker);

export default MenuPicker;
export {
  OrderMenuPicker,
  EventMenuPicker,
  GroupMenuPicker,
};
