import React, {Component, PropTypes} from "react";
import {createContainer} from "meteor/react-meteor-data";
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';


export class Login extends Component {
	constructor(props) {
		super(props);
	}

	loginWithGoogle() {

		Meteor.loginWithGoogle({
			requestPermissions: ['email', 'profile'],
			loginStyle: "popup"
		}, (err) => {
			if (err) {
				console.log(err.reason);
			} else {
				console.log('Success!');
			}
		});

	}

	submit(e) {
		e.preventDefault();

		const email = ReactDOM.findDOMNode(this.refs.login).value.trim();
		const password = ReactDOM.findDOMNode(this.refs.password).value.trim();

		Meteor.loginWithPassword(email, password, function (err) {
			if(!err) {
				console.log(Meteor.user());
			}
		});

		return false;
	}

	render() {
		return (<div>
			<h1>Authorization</h1>
			<form onSubmit={ this.submit.bind(this) }>
				<button onClick={ this.loginWithGoogle.bind(this) }>Google</button>
				<input type="text" ref="login" name="login" placeholder="email"/>
				<input type="password" ref="password" name="password" placeholder="pass"/>
				<input type="submit" value={'submit'}/>
			</form>
		</div>);
	}
}

Login.propTypes = {};

export const LoginContainer = createContainer(() => {
	return {}
}, Login);