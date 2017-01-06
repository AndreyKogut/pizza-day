import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import UserListItem from '../../ui/components/UserListItem';
import UserPickerFilter from '../../ui/components/UserListFilter';

const propTypes = {
  list: PropTypes.arrayOf(Object),
  getUsersList: PropTypes.func,
  usersLoading: PropTypes.bool,
  pickedUsers: PropTypes.arrayOf(Object),
};

const defaultProps = {
  list: [],
  pickedUsers: [],
  getUsersList: () => {},
};

class UserPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: new Set(...[this.props.pickedUsers]),
    };
  }

  getAllUsers = () => {
    let filteredData;

    if (!this.state.filteredUsers) {
      filteredData = this.props.list;
    } else {
      filteredData = this.state.filteredUsers;
    }

    return filteredData.map((user) => {
      if (_.some([...this.state.users], val => user._id === val._id)) return '';

      return (<UserListItem
        key={user._id}
        userObject={user}
        clickCallback={(clickedUser) => {
          this.addUser(clickedUser);
        }}
      />);
    });
  };

  getPickedUsers = () =>
    [...this.state.users].map(user =>
      (<UserListItem
        key={user._id}
        userObject={user}
        clickCallback={(clickedUser) => { this.deleteUser(clickedUser); }}
      />));

  addUser = (user) => {
    const newState = new Set(this.state.users);
    newState.add(user);

    this.setState({
      users: newState,
    }, () => {
      this.props.getUsersList(_.pluck([...this.state.users], '_id'));
    });
  };

  deleteUser(user) {
    const newState = new Set(this.state.users);
    newState.delete(user);

    this.setState({
      users: newState,
    }, () => {
      this.props.getUsersList(_.pluck([...this.state.users], '_id'));
    });
  }

  filterUsers = ({ name = '', email = '' }) => {
    const filteredUsers = this.props.list.filter(
      (user) => {
        _.defaults(user, {
          profile: {
            name: '',
          },
          emails: [{
            address: '',
          }],
        });

        return user.emails[0].address.includes(email) &&
          user.profile.name.includes(name);
      },
    );

    this.setState({
      filteredUsers,
    });
  };

  render() {
    if (this.props.usersLoading) {
      return <div>Loading...</div>;
    }

    return (<div className="user-picker">
      <h3 className="user-picker__h">Filter data</h3>
      <UserPickerFilter changeCallback={(filter) => { this.filterUsers(filter); }} />
      <div className="user-picker__data">
        <div className="user-picker__all">
          <h3 className="user-picker__h">Users:</h3>
          <div className="user-picker__list">
            { this.getAllUsers() }
          </div>
        </div>
        <div className="user-picker__picked">
          <h3 className="user-picker__h">Picked:</h3>
          <div className="user-picker__list">
            { this.getPickedUsers() }
          </div>
        </div>
      </div>
    </div>);
  }
}

UserPicker.propTypes = propTypes;
UserPicker.defaultProps = defaultProps;

const UserPickerContainer = createContainer((props) => {
  const handleUsers = Meteor.subscribe('UsersList');

  const list = Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();

  return {
    ...props,
    list,
    usersLoading: !handleUsers.ready(),
  };
}, UserPicker);

export default UserPickerContainer;
