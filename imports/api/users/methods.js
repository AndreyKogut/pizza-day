import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';
import checkData from '../checkData';
import Groups from '../../api/groups/collection';

Meteor.publish('user', (id) => {
  check(id, Match.Where(checkData.notEmpty));

  return Meteor.users.find(id);
});

Meteor.methods({
  'user.insert': function insert(requestData) {
    const requestDataFormat = {
      email: String,
      password: String,
      profile: Match.Maybe(Object),
    };

    check(requestData, requestDataFormat);
    check(requestData.email, String);
    check(requestData.password, String);

    Accounts.createUser(requestData);

    return {
      email: requestData.email,
      password: requestData.password,
    };
  },

  'user.update': function update(requestData) {
    const requestDataFormat = {
      name: Match.Maybe(String),
      avatar: Match.Maybe(String),
      email: Match.Maybe(String),
      about: Match.Maybe(String),
      company: Match.Maybe(String),
      position: Match.Maybe(String),
    };

    if (!this.userId) {
      throw new Meteor.Error(401, 'Access denied');
    }

    check(requestData, requestDataFormat);

    const updateFields = {
      emails: requestData.email ? [{ address: requestData.email, verified: false }] : '',
      'profile.name': requestData.name,
      'profile.avatar': requestData.avatar,
      'profile.about': requestData.about,
      'profile.company': requestData.company,
      'profile.position': requestData.position,
    };

    const updateData = _.pick(updateFields, value => value);

    Meteor.users.upsert(this.userId, {
      $set: {
        ...updateData,
      },
    });
  },
});

Meteor.publish('UsersList', function publishUsers() {
  if (!this.userId) {
    return this.error(new Meteor.Error(401, 'Access denied'));
  }

  return Meteor.users.find({ _id: { $ne: this.userId } }, { fields: { emails: 1, profile: 1 } });
});

Meteor.publish('GroupMembers', function publishGroupMembers(groupId) {
  check(groupId, Match.Where(checkData.notEmpty));

  if (!this.userId) {
    return this.error(new Meteor.Error(401, 'Access denied'));
  }

  const members = Groups.findOne({ _id: groupId }).members;

  const usersId = _.pluck(members, '_id');

  return Meteor.users.find({ _id: { $in: [...usersId] } }, { fields: { emails: 1, profile: 1 } });
});