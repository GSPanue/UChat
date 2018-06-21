import React from 'react';
import Sidebar from './components/sidebar/Sidebar';
import Window from './components/window/Window';
import Error from './components/error/Error';
import {createBrowserHistory} from 'history';

const browserHistory = createBrowserHistory();
const database = require('~/database/database');

const styles = ({
    contentContainer: {
        display: 'flex',
        flex: '1'
    }
});

export default class Interface extends React.Component {
    constructor() {
        super();

        this.state = {
            status: {
                loading: true,
                signedIn: false
            },
            user: null,
            groups: null,
            messages: null,
            tabs: {
                isOptionsTab: false,
                selectedOnTabA: 1,
                selectedOnTabB: 1
            },
            error: false
        }
    };

    componentWillMount() {
        database.goOnline();

        this.authListener = database.onAuthChange((currentUser) => {
            if (currentUser !== null) {
                this.setState({
                    status: {
                        ...this.state.status, loading: true
                    }
                }, () => {
                    this.listenForUserUpdate();

                    database.fetchUser(currentUser, (currentUserInformation) => {
                        const user = Object.assign({}, currentUserInformation, {
                            uid: currentUser.uid,
                            lastSignInTime: currentUser.metadata.lastSignInTime,
                            creationTime: currentUser.metadata.creationTime
                        });

                        const joinViaURL = this.props.location.state !== undefined;

                        if (joinViaURL) {
                            database.joinGroup(user, this.props.location.state.id, () => {
                                browserHistory.replace({
                                    pathname: '/',
                                    state: undefined
                                });
                            });
                        }

                        database.fetchUserGroups(user, (groups) => {
                            if (groups !== null) {
                                database.fetchMultipleGroupMessages(user, groups, (messages) => {
                                    this.setState({
                                        user: user,
                                        groups: groups,
                                        tabs: {
                                            ...this.state.tabs, isOptionsTab: (groups === null)
                                        },
                                        messages: messages
                                    }, () => {
                                        this.setState({
                                            status: {
                                                ...this.state.status, loading: false, signedIn: true
                                            }
                                        }, () => {
                                            this.listenForMessages();
                                            this.listenForGroupUpdates();

                                            groups.map((group) => {
                                                database.setOnlineStatus(user, group.id, true, (response) => {
                                                    (response) && database.onDisconnect(group.id);
                                                });
                                            });
                                        });
                                    });
                                });
                            }
                            else {
                                this.setState({
                                    user: user,
                                    groups: groups,
                                    tabs: {
                                        ...this.state.tabs, isOptionsTab: (groups === null)
                                    }
                                }, () => {
                                    this.setState({
                                        status: {
                                            ...this.state.status, loading: false, signedIn: true
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            }
            else {
                this.setState({
                    user: null,
                    status: {
                        ...this.state.status, loading: false, signedIn: (currentUser !== null)
                    },
                    tabs: {
                        ...this.state.tabs, isOptionsTab: false, selectedOnTabA: 1, selectedOnTabB: 1
                    },
                    groups: null,
                    messages: null,
                    error: false
                });
            }
        }).bind(this);
    }

    listenForUserUpdate = () => {
        database.onUserUpdate((update) => {
            const selected = this.state.tabs.selectedOnTabA - 1;

            if (this.state.user !== null) {
                const currentGroups = (this.state.groups === null) ? [] : this.state.groups;
                const currentMessages = this.state.messages;

                const noGroups = !update.hasOwnProperty('groups');

                if (noGroups && currentGroups.length === 1) {
                    this.setState({
                        groups: null,
                        messages: null,
                        tabs: {
                            ...this.state.tabs, isOptionsTab: true, selectedOnTabA: 1
                        }
                    }, () => {
                        if (currentGroups.length > 0) {
                            this.stopListeningForDisconnect();
                            this.stopListeningForMessages();
                            this.stopListeningForGroupUpdates();
                        }
                    });
                }
                else if (!noGroups && update.groups.length !== currentGroups.length) {
                    const updatedGroups = update.groups.map(group => group.id);

                    let updateGroups = (currentGroups !== null && (currentGroups.length !== updatedGroups.length));

                    if (updateGroups) {
                        let newGroups = null;
                        let newMessages = null;

                        if (updatedGroups.length < currentGroups.length) {
                            const removedGroup = currentGroups.filter(group => !updatedGroups.includes(group.id))[0];

                            newGroups = currentGroups.filter(group => updatedGroups.includes(group.id));
                            newMessages = Object.keys(currentMessages)
                                .filter(key => updatedGroups.includes(key))
                                .reduce((groupMessages, key) => {
                                    groupMessages[key] = currentMessages[key];

                                    return groupMessages;
                                }, {});

                            this.setState({
                                groups: newGroups,
                                messages: (Object.keys(newMessages).length === 0) ? null : newMessages,
                                tabs: {
                                    ...this.state.tabs, selectedOnTabA: (selected === 0) ? 1 : selected
                                }
                            }, () => {
                                database.detachOnDisconnect(removedGroup.id, false);
                                database.detachOnMessagesUpdate(removedGroup.id, false);
                                database.detachOnGroupUpdate(removedGroup.id, false);
                            });
                        }
                        else if (updatedGroups.length > currentGroups.length) {
                            const joinedGroup = updatedGroups.filter(id => !currentGroups.map((group) => {
                                return group.id;
                            }).includes(id))[0];

                            database.fetchGroup(joinedGroup, (groupInformation) => {
                                const user = this.state.user;

                                const group = Object.assign({
                                    id: joinedGroup
                                }, groupInformation);

                                newGroups = currentGroups.slice();
                                newGroups.push(group);

                                database.fetchMessages(user, joinedGroup, (messages) => {
                                    newMessages = Object.assign({}, currentMessages, {
                                        [messages.key]: messages.messages
                                    });

                                    this.setState({
                                        groups: newGroups,
                                        messages: newMessages,
                                        tabs: {
                                            ...this.state.tabs, isOptionsTab: false, selectedOnTabA: (newGroups.length)
                                        }
                                    }, () => {
                                        this.listenForGroupUpdates();
                                        this.listenForMessages();

                                        database.setOnlineStatus(user, joinedGroup, true, (response) => {
                                            if (response) {
                                                database.onDisconnect(joinedGroup);
                                            }
                                        });
                                    });
                                });
                            });
                        }
                    }
                }
                else {
                    const user = Object.assign({}, this.state.user, update.information);

                    this.setState({
                        user: user
                    });
                }
            }
        });
    };

    listenForMessages = () => {
        const groups = this.state.groups;

        groups.forEach((group) => {
            database.onMessagesUpdate(group.id, (message) => {
                this.handleMessagesUpdate(group.id, message, false);
            });
        })
    };

    listenForGroupUpdates = () => {
        let groups = this.state.groups;

        groups.forEach((group) => {
            database.onGroupUpdate(group.id, (update) => {
                groups = this.state.groups;

                groups.map((currentGroup) => {
                    if (group.id === currentGroup.id) {
                        if (update.event === 'child_removed') {
                            delete currentGroup[update.key];
                        }
                        else if (update.event === 'child_changed') {
                            currentGroup[update.key] = update.value;
                        }
                    }
                });

                this.setState({
                    groups: groups
                });
            });
        });
    };

    stopListeningForUserUpdates = () => {
        database.detachOnUserUpdate();
    };

    stopListeningForDisconnect = () => {
        database.detachOnDisconnect(null, true);
    };

    stopListeningForMessages = () => {
        database.detachOnMessagesUpdate(null, true);
    };

    stopListeningForGroupUpdates = () => {
        database.detachOnGroupUpdate(null, true);
    };

    componentWillUnmount() {
        this.authListener();

        this.stopListeningForUserUpdates();
        this.stopListeningForDisconnect(null, true);
        this.stopListeningForMessages(null, true);
        this.stopListeningForGroupUpdates(null, true);

        database.goOffline();
    }

    handleLeaveGroup = () => {
        const index = this.state.tabs.selectedOnTabA - 1;
        const group = this.state.groups[index];

        database.leaveGroup(this.state.user, group.id, (response) => {
            if (response) {
                if (this.props.location.state !== undefined) {
                    browserHistory.replace({
                        pathname: '/',
                        state: undefined
                    });
                }
            }
            else {
                this.handleError(true);
            }
        });
    };

    handleDeleteGroup = () => {
        const index = this.state.tabs.selectedOnTabA - 1;
        const group = this.state.groups[index];

        database.deleteGroup(this.state.user, group.id, (response) => {
            if (!response) {
                this.handleError(true);
            }
        });
    };

    handleSignOut = () => {
        const user = this.state.user;

        this.setState({
            status: {
                ...this.state.status, loading: true
            }
        }, () => {
            this.stopListeningForUserUpdates();
            this.stopListeningForDisconnect(null, true);
            this.stopListeningForMessages(null, true);
            this.stopListeningForGroupUpdates(null, true);

            database.fetchUserGroups(user, (groups) => {
                if (groups !== null) {
                    groups.map((group, index) => {
                        database.setOnlineStatus(user, group.id, false, () => {
                            if (groups.length - 1 === index) {
                                database.signOut();
                            }
                        });
                    });
                }
                else {
                    database.signOut();
                }
            });
        });
    };

    handleTabChange = (isOptionsTab) => {
        this.setState({
            tabs: {
                ...this.state.tabs, isOptionsTab: isOptionsTab
            }
        });
    };

    handleSelectedItem = (selected) => {
        const currentTab = (this.state.tabs.isOptionsTab) ? 'selectedOnTabB' : 'selectedOnTabA';

        this.setState({
            tabs: {
                ...this.state.tabs, [currentTab]: selected
            }
        });
    };

    handleSendMessage = (id, user, message) => {
        database.addMessage(id, user, message, (response) => {
            if (!response) {
                this.handleError(true);
            }
        });
    };

    handleMessagesUpdate = (id, messages, concatenate) => {
        let currentMessages = this.state.messages;

        currentMessages[id] = (concatenate) ? Object.assign({}, messages, currentMessages[id]) :
            Object.assign({}, currentMessages[id], {[messages.key]: messages.value});

        this.setState({
            messages: currentMessages
        });
    };

    handleError = (hasError) => {
        if (hasError && !this.state.error) {
            this.stopListeningForMessages(null, true);
            this.stopListeningForGroupUpdates(null, true);
        }

        this.setState({
            error: hasError
        });
    };

    render() {
        const sidebarState = {
            loading: this.state.status.loading,
            signedIn: this.state.status.signedIn,
            tabs: this.state.tabs,
            user: this.state.user,
            groups: this.state.groups,
            messages: this.state.messages
        };

        const windowState = {
            loading: this.state.status.loading,
            signedIn: this.state.status.signedIn,
            user: this.state.user,
            tabs: this.state.tabs,
            groups: this.state.groups,
            messages: this.state.messages
        };

        return (
            <div style={styles.contentContainer}>
                <Sidebar
                    state={sidebarState}
                    signOut={(this.state.status.signedIn) ? this.handleSignOut : null}
                    handleTabChange={this.handleTabChange}
                    handleSelectedItem={this.handleSelectedItem}
                    handleError={this.handleError}
                />
                <Window
                    state={windowState}
                    handleTabChange={this.handleTabChange}
                    handleSendMessage={this.handleSendMessage}
                    handleMessagesUpdate={this.handleMessagesUpdate}
                    handleLeaveGroup={this.handleLeaveGroup}
                    handleDeleteGroup={this.handleDeleteGroup}
                    handleError={this.handleError}
                />
                <Error
                    error={this.state.error}
                    handleError={this.handleError}
                />
            </div>
        );
    }
}