const config = {
    apiKey: 'AIzaSyAdV4uerb8oc1DarUMy9ohuEW3hPGe2DXw',
    authDomain: 'uchat-59d20.firebaseapp.com',
    databaseURL: 'https://uchat-59d20.firebaseio.com',
    projectId: 'uchat-59d20',
    storageBucket: 'uchat-59d20.appspot.com',
    messagingSenderId: '971821845222'
};

const Firebase = require('firebase');
const firebase = require('firebase').initializeApp(config);
const firebaseSecondary = require('firebase').initializeApp(config, 'Secondary');

const auth = firebase.auth();
const authSecondary = firebaseSecondary.auth();

const database = firebase.database();
const usersRef = database.ref('users');
const groupsRef = database.ref('groups');
const messagesRef = database.ref('messages');

/**
 * |
 * |
 * | Database
 * |
 * |
 */

/**
 * goOnline: Connects to Firebase Database.
 */
const goOnline = () => {
    database.goOnline();
};

/**
 * goOffline: Disconnects from Firebase Database.
 */
const goOffline = () => {
    database.goOffline();
};

/**
 * |
 * |
 * | Authentication
 * |
 * |
 */

/**
 * signIn: Signs a user in.
 */
const signIn = (user, callback) => {
    auth.signInWithEmailAndPassword(user.emailAddress, user.password)
        .then(() => {
            callback({
                success: true,
                error: null
            });
        }).catch((error) => {
        callback({
            success: false,
            error: error.code
        });
    });
};

/**
 * signOut: Signs a user out.
 */
const signOut = () => {
    auth.signOut();
};

/**
 * |
 * |
 * | Verification
 * |
 * |
 */

/**
 * verifyUser: Verifies the user's client side user information.
 */
const verifyUser = (user, uidOnly, exclude, callback) => {
    let currentUser = getCurrentUser();

    if (uidOnly) {
        callback(currentUser.uid === user.uid);
    }
    else {
        // Removes the sign in date and creation date properties.
        user = Object.keys(user)
            .filter(key => key !== 'lastSignInTime' && key !== 'creationTime')
            .reduce((object, key) => {
                object[key] = user[key];
                return object;
            }, {});

        // Fetches the current user's information.
        usersRef.child(currentUser.uid).child('information').once('value', (currentUserInformation) => {
            currentUser = Object.assign({}, {uid: currentUser.uid}, currentUserInformation.val());

            let hasValidUserInformation = true;

            // Compares the user's client side user information with the current user's information.
            Object.keys(currentUser).map((key) => {
                if (!exclude.includes(key) && currentUser[key] !== user[key]) {
                    hasValidUserInformation = false;
                }
            });

            callback(hasValidUserInformation);
        });
    }
};

/**
 * verifyGroup: Verifies the user's client side group information.
 */
const verifyGroup = (user, gid, exclude, callback) => {
    verifyUser(user, false, exclude, (isValidUser) => {
        if (isValidUser) {
            let currentUser = getCurrentUser();

            // Fetches the ids for each group that the current user is in.
            usersRef.child(currentUser.uid).child('groups').once('value', (groups) => {
                let isInGroup = false;

                if (groups.exists()) {
                    // Check if the group id is in the current user's joined groups.
                    isInGroup = groups.val().filter((group) => {
                        return group.id === gid
                    }).length > 0;
                }

                callback(isInGroup);
            });
        }
        else {
            callback(false);
        }
    })
};

/**
 * verifyAdmin: Verifies that the user is an administrator of a group.
 */
const verifyAdmin = (user, gid, callback) => {
    // Fetches the group administrator's id and compares it with the current user's id.
    groupsRef.child(gid).child('admin').once('value', (admin) => {
        callback(user.uid === admin.val());
    });
};

/**
 * |
 * |
 * | User
 * |
 * |
 */

/**
 * getCurrentUser: Returns the current user's authentication information.
 */
const getCurrentUser = () => {
    return auth.currentUser;
};

/**
 * addUser: Creates a new user account.
 */
const addUser = (unregisteredUser, callback) => {
    // User's email address and password is stored in Firebase Authentication.
    authSecondary.createUserWithEmailAndPassword(unregisteredUser.emailAddress, unregisteredUser.password)
        .then((user) => {
            // User's information is stored in Firebase Database.
            usersRef.child(user.uid).child('information').set({
                fullName: (unregisteredUser.firstName + ' ' + unregisteredUser.lastName),
                firstName: unregisteredUser.firstName,
                lastName: unregisteredUser.lastName,
                emailAddress: unregisteredUser.emailAddress,
            }).then(() => {
                // Closes the connection to Firebase Authentication.
                authSecondary.signOut().then(() => {
                    callback({
                        success: true,
                        error: null
                    });
                })
            });
        })
        .catch((error) => {
            callback({
                success: false,
                error: error.code
            });
        });
};

/**
 * updateUser: Updates the user's account information.
 */
const updateUser = (user, isAuthUpdate, callback) => {
    verifyUser(user, true, [], (isValidUser) => {
        if (isValidUser) {
            if (!isAuthUpdate) {
                const name = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: (user.firstName + ' ' + user.lastName)
                };

                // Updates the user's first name, last name and full name.
                usersRef.child(user.uid).child('information').update(name).then(() => {
                    usersRef.child(user.uid).child('groups').once('value', (userGroups) => {
                        if (userGroups.exists()) {
                            // Updates the user's first name, last name and full name in all groups.
                            userGroups.forEach((group) => {
                                group = group.val();

                                groupsRef.child(group.id).child('members').child(user.uid).child('user').update(name).then(() => {
                                    if (group.id === userGroups.val()[userGroups.val().length - 1].id) {
                                        callback(true);
                                    }
                                });
                            });
                        }
                        else {
                            callback(true);
                        }
                    });
                });
            }
            else {
                const currentUser = getCurrentUser();
                const credential = Firebase.auth.EmailAuthProvider.credential(currentUser.email, user.password);

                currentUser.reauthenticateWithCredential(credential).then(() => {
                    const isUpdateEmail = user.hasOwnProperty('newEmailAddress');

                    if (isUpdateEmail) {
                        // Updates the user's email address.
                        currentUser.updateEmail(user.newEmailAddress).then(() => {
                            usersRef.child(currentUser.uid).child('information').update({
                                emailAddress: user.newEmailAddress
                            }).then(() => {
                                callback(true);
                            });
                        }).catch((error) => {
                            callback(error.code);
                        })
                    }
                    else {
                        // Updates the user's password.
                        currentUser.updatePassword(user.newPassword).then(() => {
                            callback(true);
                        });
                    }
                }).catch((error) => {
                    callback(error.code);
                });
            }
        }
        else {
            callback(false);
        }
    });
};

/**
 * setOnlineStatus: Sets the online status for a user in a group.
 */
const setOnlineStatus = (user, gid, status, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            // Checks if the member is in the group.
            groupsRef.child(gid).child('members').child(user.uid).once('value', (member) => {
                if (member.exists()) {
                    // Updates the member's online field.
                    member.ref.update({
                        online: status
                    }).then(() => {
                        callback(true);
                    });
                }
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * fetchUser: Fetches a user's information.
 */
const fetchUser = (user, callback) => {
    usersRef.child(user.uid).once('value', (user) => {
        callback(user.val()['information']);
    });
};

/**
 * fetchUserGroups: Fetches the groups that a user is in.
 */
const fetchUserGroups = (user, callback) => {
    verifyUser(user, false, [], (isValidUser) => {
        if (isValidUser) {
            // Fetches the ids for each group that the user is in.
            usersRef.child(user.uid).child('groups').once('value', (groups) => {
                if (groups.exists()) {
                    let userGroups = groups.val();

                    // Fetches each group's information.
                    userGroups.map((group, index) => {
                        fetchGroup(group.id, (groupInformation) => {
                            Object.assign(group, groupInformation);

                            if (index === (userGroups.length - 1)) {
                                callback(userGroups);
                            }
                        });
                    });
                }
                else {
                    callback(null);
                }
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * |
 * |
 * | Groups
 * |
 * |
 */

/**
 * updateGroup: Updates a group's title or description.
 */
const updateGroup = (user, gid, update, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            verifyAdmin(user, gid, (isValidAdmin) => {
                if (isValidAdmin) {
                    groupsRef.child(gid).update({
                        [update.key]: update.value
                    }).then(() => {
                        callback(true);
                    });
                }
                else {
                    callback(false);
                }
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * fetchGroup: Fetches the information for a group.
 */
const fetchGroup = (gid, callback) => {
    if (gid !== null) {
        groupsRef.child(gid).once('value', (groupInformation) => {
            callback(groupInformation.val());
        });
    }
    else {
        callback(null);
    }
};

/**
 * setTyping: Sets the typing state of a user in a group.
 */
const setTyping = (user, gid, typing, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            // Checks if the member is in the group.
            groupsRef.child(gid).child('members').child(user.uid).once('value', (member) => {
                if (member.exists()) {
                    // Updates the typing field of a member in a group with a boolean value.
                    member.ref.update({
                        typing: typing
                    }).then(() => {
                        callback(true);
                    });
                }
                else {
                    callback(false);
                }
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * createGroup: Creates a group.
 */
const createGroup = (user, groupInformation, callback) => {
    verifyUser(user, false, [], (isValidUser) => {
        if (isValidUser) {
            // Adds the group information to the database and is assigned the group's id.
            const gid = groupsRef.push({
                title: groupInformation.title,
                description: groupInformation.description,
                members: groupInformation.members,
                admin: user.uid
            }).getKey();

            // Sets a placeholder value of zero for the total messages count of the new group.
            messagesRef.child('counter').child(gid).set(0).then(() => {
                joinGroup(user, gid, (response) => {
                    callback(response);
                });
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * Adds a user to a group.
 */
const joinGroup = (user, gid, callback) => {
    verifyUser(user, false, [], (isValidUser) => {
        if (isValidUser) {
            // Checks if the group exists.
            groupsRef.child(gid).child('members').child('counter').once('value', (totalMembers) => {
                if (totalMembers.exists()) {
                    // Checks if the user is banned from the group.
                    groupsRef.child(gid).child('banned').child(user.uid).once('value', (bannedMember) => {
                        if (bannedMember.exists()) {
                            callback({
                                banned: true
                            });
                        }
                        else {
                            // Fetches the ids for each group that the user is in.
                            usersRef.child(user.uid).child('groups').once('value', (groups) => {
                                let userGroups = (groups.exists()) ? groups.val() : [];
                                let isNotInGroup = (userGroups.findIndex(group => group.id === gid) === -1);

                                if (isNotInGroup) {
                                    // Adds the user's information to the group's members node.
                                    groupsRef.child(gid).child('members').child(user.uid).set({
                                        timeStamp: Firebase.database.ServerValue.TIMESTAMP,
                                        online: false,
                                        typing: false,
                                        user: {
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            fullName: user.fullName,
                                            uid: user.uid
                                        }
                                    }).then(() => {
                                        // Increments the group's members counter by one.
                                        totalMembers.ref.set(totalMembers.val() + 1);
                                    }).then(() => {
                                        // Adds a message to the group's messages node.
                                        messagesRef.child(gid).push({
                                            type: 'notification',
                                            message: 'joined',
                                            timeStamp: Firebase.database.ServerValue.TIMESTAMP,
                                            user: {
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                fullName: user.fullName,
                                                uid: user.uid
                                            }
                                        });
                                    }).then(() => {
                                        // Increments the group's messages counter by one.
                                        messagesRef.child('counter').child(gid).once('value', (totalMessages) => {
                                            totalMessages.ref.set(totalMessages.val() + 1);
                                        });
                                    }).then(() => {
                                        userGroups.push({
                                            id: gid
                                        });

                                        // Updates the user's groups node with the id of group joined.
                                        groups.ref.set(userGroups).then(() => {
                                            callback(true);
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    callback(false);
                }
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * leaveGroup: Removes a user from a group.
 */
const leaveGroup = (user, gid, callback) => {
    verifyUser(user, false, [], (isValidUser) => {
        if (isValidUser) {
            // Checks if the group exists.
            groupsRef.child(gid).child('members').child('counter').once('value', (totalMembers) => {
                if (totalMembers.exists()) {
                    // Removes the user from the group's members node and decrements the group's members counter by one.
                    groupsRef.child(gid).child('members').child(user.uid).remove().then(() => {
                        totalMembers.ref.set(totalMembers.val() - 1);
                    }).then(() => {
                        // Adds a message to the group's messages node.
                        messagesRef.child(gid).push({
                            type: 'notification',
                            message: 'left',
                            timeStamp: Firebase.database.ServerValue.TIMESTAMP,
                            user: {
                                firstName: user.firstName,
                                lastName: user.lastName,
                                fullName: user.fullName,
                                uid: user.uid
                            }
                        });
                    }).then(() => {
                        // Increments the group's messages counter by one.
                        messagesRef.child('counter').child(gid).once('value', (totalMessages) => {
                            totalMessages.ref.set(totalMessages.val() + 1);
                        });
                    }).then(() => {
                        // Fetches the ids for each group that the user is in.
                        usersRef.child(user.uid).child('groups').once('value', (groups) => {
                            let userGroups = groups.val();

                            userGroups = userGroups.filter((group) => {
                                return group.id !== gid
                            });

                            // Updates the user's groups node with the id of the left group removed.
                            groups.ref.set(userGroups).then(() => {
                                callback(true);
                            });
                        });
                    });
                }
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * deleteGroup: Deletes a group.
 */
const deleteGroup = (user, gid, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            verifyAdmin(user, gid, (isValidAdmin) => {
                if (isValidAdmin) {
                    // Fetches all of the members in the group.
                    groupsRef.child(gid).child('members').once('value', (members) => {
                        members = members.val();
                        delete members['counter'];

                        Object.keys(members).map((member, index) => {
                            // Fetches the groups that a member is in.
                            usersRef.child(member).child('groups').once('value', (groups) => {
                                let memberGroups = groups.val();

                                memberGroups = memberGroups.filter((group) => {
                                    return group.id !== gid
                                });

                                // Updates the member's groups node with the id of the group to be deleted removed.
                                usersRef.child(member).update({
                                    groups: memberGroups
                                }).then(() => {
                                    if (Object.keys(members).length - 1 === index) {
                                        // Deletes the group's group and messages node.
                                        groupsRef.child(gid).remove();
                                        messagesRef.child(gid).remove();
                                        messagesRef.child('counter').child(gid).remove();

                                        callback(true);
                                    }
                                })
                            });
                        });

                    });
                }
                else {
                    callback(false);
                }
            })
        }
        else {
            callback(false);
        }
    });
};

/**
 * banUser: Bans a user from a group.
 */
const banUser = (user, gid, mid, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            verifyAdmin(user, gid, (isValidAdmin) => {
                if (isValidAdmin) {
                    // Checks if the user isn't banned already.
                    groupsRef.child(gid).child('banned').child(mid).once('value', (member) => {
                        if (!member.exists()) {
                            // Fetches the banned user's user information.
                            usersRef.child(mid).child('information').once('value', (userInformation) => {
                                let bannedUser = userInformation.val();

                                bannedUser = Object.assign({}, bannedUser, {
                                    uid: mid
                                });

                                delete bannedUser['emailAddress'];

                                let isInGroup = false;

                                // Fetches the ids for each group that the user is in.
                                usersRef.child(bannedUser.uid).child('groups').once('value', (groups) => {
                                    if (groups.exists()) {
                                        let bannedUserGroups = groups.val();

                                        isInGroup = bannedUserGroups.filter((group) => group.id === gid).length > 0;

                                        if (isInGroup) {
                                            bannedUserGroups = bannedUserGroups.filter((group) => {
                                                return group.id !== gid
                                            });

                                            // Updates the user's groups node with the id of the banned group removed.
                                            usersRef.child(bannedUser.uid).update({
                                                groups: bannedUserGroups
                                            }).then(() => {
                                                callback(true);
                                            });
                                        }
                                        else {
                                            callback(true);
                                        }
                                    }
                                    else {
                                        callback(true);
                                    }
                                }).then(() => {
                                    // Adds the banned user to the group's banned node.
                                    groupsRef.child(gid).child('banned').child(bannedUser.uid).set({
                                        banned: true,
                                        timeStamp: Firebase.database.ServerValue.TIMESTAMP,
                                        user: bannedUser
                                    });
                                }).then(() => {
                                    if (isInGroup) {
                                        groupsRef.child(gid).child('members').child('counter').once('value', (totalMembers) => {
                                            // Removes the user from the group's members node.
                                            groupsRef.child(gid).child('members').child(bannedUser.uid).remove().then(() => {
                                                // Decrements the group's members counter by one.
                                                totalMembers.ref.set(totalMembers.val() - 1);
                                            });
                                        });
                                    }
                                }).then(() => {
                                    groupsRef.child(gid).child('banned').child('counter').once('value', (totalBanned) => {
                                        // Increments the group's banned counter by one.
                                        totalBanned.ref.set(totalBanned.val() + 1);
                                    });
                                }).then(() => {
                                    // Adds a message to the group's messages node.
                                    messagesRef.child(gid).push({
                                        type: 'notification',
                                        message: 'banned',
                                        timeStamp: Firebase.database.ServerValue.TIMESTAMP,
                                        user: bannedUser
                                    });
                                }).then(() => {
                                    messagesRef.child('counter').child(gid).once('value', (totalMessages) => {
                                        // Increments the group's messages counter by one.
                                        totalMessages.ref.set(totalMessages.val() + 1);
                                    });
                                });
                            });
                        }
                        else {
                            callback(true);
                        }
                    });
                }
                else {
                    callback(false);
                }
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * unbanUser: Unbans a user from a group.
 */
const unbanUser = (user, gid, mid, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            verifyAdmin(user, gid, (isValidAdmin) => {
                if (isValidAdmin) {
                    // Removes the user from the group's banned node.
                    groupsRef.child(gid).child('banned').child(mid).remove().then(() => {
                        groupsRef.child(gid).child('banned').child('counter').once('value', (totalBanned) => {
                            if (totalBanned.val() > 1) {
                                // Decrements the group's banned counter.
                                totalBanned.set(totalBanned.val() - 1);
                            }
                            else {
                                totalBanned.ref.remove();
                            }

                            callback(true);
                        });
                    })
                }
                else {
                    callback(false);
                }
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * |
 * |
 * | Messages
 * |
 * |
 */

/**
 * fetchMessages: Fetches the messages for a group.
 */
const fetchMessages = (user, gid, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            // Fetches the last 35 messages.
            messagesRef.child(gid).orderByKey().limitToLast(35).once('value', (messages) => {
                callback({
                    key: messages.key,
                    messages: messages.val()
                });
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * fetchMultipleGroupMessages: Fetches the messages for each group that the user is in.
 */
const fetchMultipleGroupMessages = (user, groups, callback) => {
    let messages = {};

    groups.map((group) => {
        fetchMessages(user, group.id, (group) => {
            // Adds the messages in the group to the messages object.
            (group !== false) ? messages[group.key] = group.messages : false;

            if (Object.keys(messages).length === groups.length) {
                callback(messages);
            }
        });
    });
};

/**
 * fetchMoreMessages: Fetches additional messages.
 */
const fetchMoreMessages = (user, gid, oldestMessage, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            // Fetches 35 messages older than the current oldest message.
            messagesRef.child(gid).orderByKey().endAt(oldestMessage).limitToLast(35).once('value', (messages) => {
                callback({
                    key: messages.key,
                    messages: messages.val()
                });
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * fetchTotalMessages: Fetches the total message count for a group.
 */
const fetchTotalMessages = (user, gid, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            // Fetches the total messages in a group.
            messagesRef.child('counter').child(gid).once('value', (totalMessages) => {
                callback(totalMessages.val());
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * addMessage: Adds a message to a groups messages node.
 */
const addMessage = (gid, user, message, callback) => {
    verifyGroup(user, gid, ['emailAddress'], (isValidGroup) => {
        if (isValidGroup) {
            // Adds the message to the groups messages node.
            messagesRef.child(gid).push({
                type: 'message',
                message: message,
                deleted : false,
                timeStamp: Firebase.database.ServerValue.TIMESTAMP,
                user: {
                    uid: user.uid,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName
                }
            }).then(() => {
                // Increments the group's messages counter by one.
                messagesRef.child('counter').child(gid).once('value', (totalMessages) => {
                    totalMessages.ref.set(totalMessages.val() + 1);
                });
            }).then(() => {
                callback(true);
            });
        }
        else {
            callback(false);
        }
    });
};

/**
 * editMessage: Edits a message in a group.
 */
const editMessage = (user, gid, message, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            // Checks if the user is editing their own message.
            if (user.uid === message.uid) {
                // Updates the message.
                messagesRef.child(gid).child(message.mid).update({
                    message: message.message
                }).then(() => {
                    callback(true);
                });
            }
            else {
                callback(false);
            }
        }
        else {
            callback(false);
        }
    });
};

/**
 * deleteMessage: Deletes a message from a group.
 */
const deleteMessage = (user, gid, message, callback) => {
    verifyGroup(user, gid, [], (isValidGroup) => {
        if (isValidGroup) {
            if (user.uid !== message.uid) {
                verifyAdmin(user, gid, (isValidAdmin) => {
                    if (isValidAdmin) {
                        // Updates the message and deleted fields.
                        messagesRef.child(gid).child(message.mid).update({
                            message: 'Message deleted',
                            deleted: true
                        }).then(() => {
                            callback(true);
                        });
                    }
                    else {
                        callback(false);
                    }
                });
            }
            else {
                // Updates the message and deleted fields.
                messagesRef.child(gid).child(message.mid).update({
                    message: 'Message deleted',
                    deleted: true
                }).then(() => {
                    callback(true);
                });
            }
        }
        else {
            callback(false);
        }
    });
};

/**
 * |
 * |
 * | Listeners
 * |
 * |
 */

let listenerManager = {
    onUserUpdate: [],
    onGroupUpdate: [],
    onMessagesUpdate: [],
    onDisconnect: []
};

/**
 * onAuthChange: Returns the currently signed in user.
 */
const onAuthChange = (callback) => {
    return auth.onAuthStateChanged(callback);
};

/**
 * addToManager: Pushes an element into an array in listenerManager.
 */
const addToManager = (id, key) => {
    listenerManager[key].push(id);
};

/**
 * removeFromManager: Removes an element from an array in listenerManager.
 */
const removeFromManager = (id, key) => {
    listenerManager[key] = listenerManager[key].filter((element) => {
        return element !== id;
    });
};

/**
 * onUserUpdate: Attaches an asynchronous listener to a user node.
 */
const onUserUpdate = (callback) => {
    const user = getCurrentUser();

    // Checks if a listener has not already been attached to the specified user node.
    if (listenerManager.onUserUpdate.length < 1) {
        addToManager(user.uid, 'onUserUpdate');

        // Attaches a listener for changes to a user's node.
        usersRef.child(user.uid).on('value', (change) => {
            callback(change.val());
        });
    }
};

/**
 * detachOnUserUpdate: Detaches an asynchronous listener from a user node.
 */
const detachOnUserUpdate = () => {
    const user = getCurrentUser();

    // Checks if a listener has been attached.
    if (listenerManager.onUserUpdate.length  === 1) {
        // Detaches a listener from the specified user node.
        usersRef.child(user.uid).off();

        removeFromManager(user.uid, 'onUserUpdate');
    }
};

/**
 * onGroupUpdate: Attaches an asynchronous listener to a group node.
 */
const onGroupUpdate = (gid, callback) => {
    // Checks if a listener has not already been attached to the specified group node.
    const isNotListening = listenerManager.onGroupUpdate.filter((id) => {
        return id === gid;
    }).length === 0;

    if (isNotListening) {
        addToManager(gid, 'onGroupUpdate');

        // Attaches a listener for changes to a group's node.
        groupsRef.child(gid).on('child_changed', (change) => {
            callback({
                key: change.key,
                value: change.val(),
                event: 'child_changed'
            });
        });

        // Attaches a listener for children that are removed from a group's node.
        groupsRef.child(gid).on('child_removed', (removed) => {
            callback({
                key: removed.key,
                value: removed.val(),
                event: 'child_removed'
            });
        });
    }
};

/**
 * detachOnGroupUpdate: Detaches an asynchronous listener from a group node.
 */
const detachOnGroupUpdate = (gid, all) => {
    if (all && listenerManager.onGroupUpdate.length > 0) {
        // Detaches all group listeners.
        const groupListeners = listenerManager.onGroupUpdate;

        groupListeners.map((id) => {
            groupsRef.child(id).off('child_changed');
            groupsRef.child(id).off('child_removed');

            removeFromManager(id, 'onGroupUpdate');
        });
    }
    else {
        // Checks if a listener has been attached to the specified group node.
        const isListening = listenerManager.onGroupUpdate.filter((id) => {
            return id === gid
        }).length > 0;

        if (isListening) {
            // Detaches a listener from the specified group node.
            groupsRef.child(gid).off('child_changed');
            groupsRef.child(gid).off('child_removed');

            removeFromManager(gid, 'onGroupUpdate');
        }
    }
};

/**
 * onMessagesUpdate: Attaches an asynchronous listener to a group messages node.
 */
const onMessagesUpdate = (gid, callback) => {
    // Checks if a listener has not already been attached to the specified group messages node.
    const isNotListening = listenerManager.onMessagesUpdate.filter((id) => {
        return id === gid;
    }).length === 0;

    if (isNotListening) {
        addToManager(gid, 'onMessagesUpdate');

        // Attaches a listener for children added to a group's messages node.
        messagesRef.child(gid).orderByKey().limitToLast(1).on('child_added', (message) => {
            callback({
                type: 'child_added',
                key: message.key,
                value: message.val()
            });
        });

        messagesRef.child(gid).on('child_changed', (change) => {
            callback({
                type: 'child_changed',
                key: change.key,
                value: change.val()
            });
        })
    }
};

/**
 * detachOnMessagesUpdate: Detaches an asynchronous listener from a group messages node.
 */
const detachOnMessagesUpdate = (gid, all) => {
    if (all && listenerManager.onMessagesUpdate.length > 0) {
        // Detaches all group message listeners.
        listenerManager.onMessagesUpdate.map((id) => {
            messagesRef.child(id).off('child_added');

            removeFromManager(id, 'onMessagesUpdate');
        });
    }
    else {
        // Checks if a listener has been attached to the specified group messages node.
        const isListening = listenerManager.onMessagesUpdate.filter((id) => {
            return id === gid;
        }).length > 0;

        if (isListening) {
            // Detaches a listener from the specified group messages node.
            messagesRef.child(gid).off('child_added');
            messagesRef.child(gid).off('child_changed');

            removeFromManager(gid, 'onMessagesUpdate');
        }
    }
};

/**
 * onDisconnect: Attaches a disconnection listener.
 */
const onDisconnect = (gid) => {
    const currentUser = getCurrentUser();

    // Checks if a listener has not already been attached to the specified group node.
    const isNotListening = listenerManager.onDisconnect.filter((id) => {
        return id === gid;
    }).length === 0;

    if (isNotListening) {
        addToManager(gid, 'onDisconnect');

        // Updates the online and typing fields in a group.
        groupsRef.child(gid).child('members').child(currentUser.uid).onDisconnect().update({
            online: false,
            typing: false
        });
    }
};

/**
 * detachOnDisconnect: Detaches the disconnection listener.
 */
const detachOnDisconnect = (gid, all) => {
    const currentUser = getCurrentUser();

    if (all && listenerManager.onDisconnect.length > 0) {
        // Detaches all disconnection listeners.
        listenerManager.onDisconnect.map((id) => {
            groupsRef.child(id).child('members').child(currentUser.uid).onDisconnect().cancel();

            removeFromManager(id, 'onDisconnect');
        });
    }
    else {
        // Checks if a listener has been attached to the specified group node.
        const isListening = listenerManager.onMessagesUpdate.filter((id) => {
            return id === gid;
        }).length > 0;

        if (isListening) {
            // Detaches a listener from the specified group node.
            groupsRef.child(gid).child('members').child(currentUser.uid).onDisconnect().cancel();

            removeFromManager(gid, 'onDisconnect');
        }
    }
};

/**
 * |
 * |
 * | Exports
 * |
 * |
 */

module.exports = {
    goOnline: goOnline,
    goOffline: goOffline,
    signIn: signIn,
    signOut: signOut,
    addUser: addUser,
    updateUser: updateUser,
    setOnlineStatus: setOnlineStatus,
    fetchUser: fetchUser,
    fetchUserGroups: fetchUserGroups,
    updateGroup: updateGroup,
    fetchGroup: fetchGroup,
    setTyping: setTyping,
    createGroup: createGroup,
    joinGroup: joinGroup,
    leaveGroup: leaveGroup,
    deleteGroup: deleteGroup,
    banUser: banUser,
    unbanUser: unbanUser,
    fetchMessages: fetchMessages,
    fetchMultipleGroupMessages: fetchMultipleGroupMessages,
    fetchMoreMessages: fetchMoreMessages,
    fetchTotalMessages: fetchTotalMessages,
    addMessage: addMessage,
    editMessage: editMessage,
    deleteMessage: deleteMessage,
    onAuthChange: onAuthChange,
    onUserUpdate: onUserUpdate,
    detachOnUserUpdate: detachOnUserUpdate,
    onGroupUpdate: onGroupUpdate,
    detachOnGroupUpdate: detachOnGroupUpdate,
    onMessagesUpdate: onMessagesUpdate,
    detachOnMessagesUpdate: detachOnMessagesUpdate,
    onDisconnect: onDisconnect,
    detachOnDisconnect: detachOnDisconnect
};