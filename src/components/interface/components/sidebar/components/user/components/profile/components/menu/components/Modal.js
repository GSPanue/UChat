import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import Profile from './components/Profile';
import Account from './components/Account';

const database = require('~/database/database');

const styles = ({
    body: {
        overflow: 'overlay',
        fontSize: '18px',
        color: 'rgb(66, 66, 66)',
        profile: {
            padding: '20px 24px 20px'
        },
        account: {
            padding: '0px 24px 20px'
        }
    },
    content: {
        profile: {
            maxWidth: '480px'
        },
        account: {
            maxWidth: '620px'
        }
    },
    button: {
        cancel: {
            color: 'rgb(66, 66, 66)'
        }
    },
    title: {
        fontSize: '20px'
    }
});

export default class Modal extends React.Component {
    constructor() {
        super();

        this.state = {
            profile: {
                updating: false,
                valid: false,
                changes: null
            },
            account: {
                updating: false,
                editing: null,
                valid: false,
                changes: null,
                error: null
            }
        }
    }

    handleValid = (isValid, changes) => {
        this.setState({
            [this.props.type]: {
                ...this.state[this.props.type], valid: isValid, changes: (isValid) ? changes : null
            }
        });
    };

    handleSubmit = () => {
        if (this.props.type === 'profile') {
            if (this.state.profile.valid) {
                let user = Object.assign({}, this.props.user);

                user.firstName = this.state.profile.changes.firstName.trim();
                user.lastName = this.state.profile.changes.lastName.trim();

                this.setState({
                    profile: {
                        ...this.state.profile, updating: true, valid: false
                    }
                }, () => {
                    database.updateUser(user, false, (response) => {
                        if (response) {
                            this.props.handleModal(false, null);

                            this.setState({
                                profile: {
                                    ...this.state.profile, updating: false, valid: false, changes: null
                                }
                            });
                        }
                        else {
                            this.props.handleModal(false, null);
                            this.props.handleError(true);

                            this.setState({
                                profile: {
                                    ...this.state.profile, updating: false, valid: false, changes: null
                                }
                            });
                        }
                    });
                });
            }
        }
        else if (this.props.type === 'account') {
            if (this.state.account.valid) {
                let user = Object.assign({}, this.props.user);

                if (this.state.account.changes.hasOwnProperty('emailAddress')) {
                    user.newEmailAddress = this.state.account.changes.emailAddress.trim();
                    user.password = this.state.account.changes.password;
                }
                else {
                    user.password = this.state.account.changes.currentPassword;
                    user.newPassword = this.state.account.changes.password;
                }

                this.setState({
                    account: {
                        ...this.state.account, updating: true
                    }
                }, () => {
                    database.updateUser(user, true, (response) => {
                        if (response === true) {
                            this.setState({
                                account: {
                                    ...this.state.account, updating: false, editing: null, valid: false, changes: null, error: null
                                }
                            });
                        }
                        else if (response !== false) {
                            this.setState({
                                account: {
                                    ...this.state.account, updating: false, valid: false, changes: null, error: response
                                }
                            });
                        }
                        else {
                            this.props.handleModal(false, null);
                            this.props.handleError(true);

                            this.setState({
                                account: {
                                    ...this.state.account, updating: false, editing: null, valid: false, changes: null, error: null
                                }
                            });
                        }
                    });
                });
            }
        }
    };

    handleCancel = () => {
        if (this.props.type === 'profile') {
            this.setState({
                profile: {
                    ...this.state.profile, updating: false, valid: false, changes: null
                }
            }, () => {
                this.props.handleModal(false, null);
            });
        }
        else if (this.props.type === 'account') {
            (this.state.account.editing === null) ? this.props.handleModal(false, null) : false;

            this.setState({
                account: {
                    ...this.state.account, editing: null, valid: false, changes: null, error: null
                }
            });
        }
    };

    handleOnClick = (editing) => {
        this.setState({
            account: {
                ...this.state.account, editing: editing
            }
        });
    };

    clearError = () => {
        this.setState({
            account: {
                ...this.state.account, error: null
            }
        });
    };

    render() {
        const accountActions = [
            <FlatButton
                label='Close'
                primary={true}
                onClick={() => this.handleCancel()}
                labelStyle={styles.button.cancel}
            />,
            <FlatButton
                label='Cancel'
                primary={true}
                onClick={() => this.handleCancel()}
                labelStyle={styles.button.cancel}
            />,
            <FlatButton
                label='Save'
                primary={true}
                disabled={(!this.state.account.valid && !this.state.account.updating) || this.state.account.updating}
                onClick={() => this.handleSubmit()}
            />
        ];

        const profileActions = [
            <FlatButton
                label='Cancel'
                primary={true}
                onClick={() => this.handleCancel()}
                labelStyle={styles.button.cancel}
            />,
            <FlatButton
                label='Save'
                primary={true}
                disabled={!this.state.profile.valid}
                onClick={() => this.handleSubmit()}
            />,
        ];

        let actions = null;

        if (this.props.type === 'account') {
            if (this.state.account.updating) {
                actions = accountActions[2];
            }
            else {
                actions = (this.state.account.editing) ? [accountActions[1], accountActions[2]] : accountActions[0];
            }
        }
        else if (this.props.type === 'profile') {
            actions = (this.state.profile.updating) ? profileActions[1] : profileActions;
        }

        return (
            <Dialog
                actions={actions}
                modal={true}
                open={this.props.open}
                autoDetectWindowHeight={true}
                bodyStyle={{...styles.body, ...(this.props.type === 'account') ? styles.body.account : styles.body.profile}}
                contentStyle={(this.props.type === 'account') ? styles.content.account : styles.content.profile}
                autoScrollBodyContent={true}
                title={(this.props.type === 'account') ? 'Account' : null}
                titleStyle={styles.title}
            >
                {this.props.type === 'profile' ? <Profile
                    user={this.props.user}
                    handleModal={this.props.handleModal}
                    handleValid={this.handleValid}
                /> : (this.props.type === 'account') ? <Account
                    user={this.props.user}
                    editing={this.state.account.editing}
                    error={this.state.account.error}
                    clearError={this.clearError}
                    handleOnClick={this.handleOnClick}
                    handleModal={this.props.handleModal}
                    handleValid={this.handleValid}
                    /> : null}
            </Dialog>
        );
    }
}