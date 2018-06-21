import React from 'react';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

const Fuse = require('fuse.js');
const fuseOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        'firstName',
        'lastName'
    ]
};

const styles = ({
    button: {
        ban: {
            color: 'rgb(66, 66, 66)'
        }
    },
    avatarContainer: {
        marginRight: '20px',
        avatar: {
            height: '60px',
            width: '60px',
            fontSize: '28px',
            background: 'rgb(91, 134, 229)'
        }
    },
    w50: {
        width: '50%'
    },
    w100: {
        width: '100%'
    },
    h100: {
        height: '100%'
    },
    column: {
        display: 'flex',
        flexDirection: 'column'
    },
    row: {
        display: 'flex',
        flexDirection: 'row'
    },
    title: {
        fontSize: '20px',
        fontWeight: '500'
    },
    subtitle: {
        fontSize: '18px',
        color: 'rgba(66, 66, 66, 0.54)'
    },
    heading: {
        fontSize: '16px',
        fontWeight: '500',
        spacing: {
            marginBottom: '4px'
        }
    },
    alignment: {
        alignItems: 'center'
    },
    spacing: {
        marginBottom: '20px',
        row: {
            justifyContent: 'space-between'
        },
        avatar: {
            marginRight: '20px'
        },
        member: {
            marginBottom: '10px'
        }
    },
    textField: {
        marginTop: '-8px',
        marginBottom: '-14px'
    },
    member: {
        offline: {
            color: 'rgba(66, 66, 66, 0.54)'
        },
        online: {
            color: 'rgb(66, 66, 66)'
        }
    },
    scrollableDiv: {
        maxHeight: '200px',
        overflowY: 'overlay'
    },
    emptySearchMessage: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: '500'
    },
    link: {
        cursor: 'pointer'
    }
});

export default class Overview extends React.Component {
    constructor() {
        super();

        this.state = {
            searchableMembers: null,
            searchText: '',
            searchResults: []
        }
    }

    componentDidMount() {
        this.setState({
            searchableMembers: this.createSearchableList(this.getMembers(this.props))
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            searchableMembers: this.createSearchableList(this.getMembers(nextProps))
        });
    }

    handleOnChange = (event) => {
        const value = event.target.value.trim();

        const searchResults = (value.length > 0) ? new Fuse(this.state.searchableMembers, fuseOptions).search(value) : [];

        this.setState({
            searchText: value,
            searchResults: searchResults
        });
    };

    createSearchableList(members) {
        return Object.keys(members).map((key) => {
            return Object.assign({}, members[key].user, {
                uid: key
            });
        }, {});
    }

    getList = () => {
        const group = this.props.group;

        let unorderedList = [];

        let members = this.getMembers(this.props);

        Object.keys(members).map((key) => {
            unorderedList.push(members[key]);
        });

        let orderedList = this.sortByTimeStamp(unorderedList);
        let membersList = [];

        const clientIsAdmin = this.props.isAdmin;

        const hasSearchResults = (this.state.searchResults.length > 0) && this.state.searchResults;
        const searchResults = (hasSearchResults) && this.state.searchResults;

        if (hasSearchResults || (!hasSearchResults && this.state.searchText.length === 0)) {
            orderedList.map((member, index) => {
                const memberIsAdmin = member.user.uid === group.admin;

                const isAResult = (hasSearchResults) && searchResults.filter((result) => {
                    return result.uid === member.user.uid;
                }).length > 0;

                if (!hasSearchResults || (hasSearchResults && isAResult)) {
                    const memberIsBanned = (member['banned'] !== undefined && member['banned']);

                    if ((clientIsAdmin && memberIsBanned) || (!memberIsBanned)) {
                        membersList.push(
                            <Member
                                key={index}
                                user={member.user}
                                role={(memberIsAdmin) ? 'Administrator' : 'Member'}
                                isBanned={memberIsBanned}
                                isAdmin={clientIsAdmin}
                                online={member.online}
                                isLastMember={(!hasSearchResults) ? orderedList.length - 1 === index :
                                    searchResults.length - 1 === membersList.length}
                                handleBan={this.props.handleBan}
                            />
                        );
                    }
                }
            });
        }
        else {
            membersList.push(
                <div key={0} style={styles.emptySearchMessage}>We couldn't find any members with that name.</div>
            );
        }

        return membersList;
    };

    sortByTimeStamp = (array) => {
        return array.sort((a, b) => a.timeStamp - b.timeStamp);
    };

    getMembers = (props) => {
        const group = props.group;
        const clientIsAdmin = props.isAdmin;

        let members = (clientIsAdmin) ? Object.assign({}, group.members, group.banned) : Object.assign({}, group.members);
        delete members['counter'];

        return members;
    };

    getMembersListTitle = () => {
        const group = this.props.group;
        const clientIsAdmin = this.props.isAdmin;

        const totalMembers = group.members.counter;
        const totalBanned = (group['banned'] !== undefined) ? group.banned.counter : 0;

        let text = 'Members (' + totalMembers + ')';

        if (clientIsAdmin && totalBanned > 0) {
            text += ' — ' + 'Banned (' + totalBanned + ')'
        }

        return text;
    };

    render() {
        const group = this.props.group;

        return(
            <div style={{...styles.w100, ...styles.h100}}>
                <div style={{...styles.row, ...styles.w100, ...styles.alignment, ...styles.spacing}}>
                    <div style={{...styles.column, ...styles.avatarContainer}}>
                        <Avatar style={styles.avatarContainer.avatar}>{group.title.charAt(0).toUpperCase()}</Avatar>
                    </div>
                    <div style={{...styles.column, ...styles.w100, ...styles.h100}}>
                        <div style={{...styles.row, ...styles.title}}>
                            {group.title}
                        </div>
                        <div style={{...styles.row, ...styles.subtitle}}>
                            {group.description}
                        </div>
                    </div>
                </div>
                {(this.props.isAdmin) && <div style={{...styles.row, ...styles.w100, ...styles.spacing}}>
                    <div style={{...styles.row, ...styles.w100}}>
                        <div style={{...styles.column, ...styles.w50}}>
                            <div style={{...styles.row, ...styles.w100, ...styles.heading}}>Group Title</div>
                            <div style={{...styles.row, ...styles.w100, ...styles.alignment}}>
                                <span style={styles.link} onClick={() => {this.props.handleChange('title')}}>Change</span>
                            </div>
                        </div>
                        <div style={{...styles.column, ...styles.w50}}>
                            <div style={{...styles.row, ...styles.w100, ...styles.heading}}>Group Description</div>
                            <div style={{...styles.row, ...styles.w100, ...styles.alignment}}>
                                <span style={styles.link} onClick={() => {this.props.handleChange('description')}}>Change</span>
                            </div>
                        </div>
                    </div>
                </div>}

                <div style={{...styles.row, ...styles.w100, ...styles.spacing}}>
                    <div style={{...styles.column, ...styles.w100}}>
                        <div style={{...styles.row, ...styles.heading}}>
                            {this.getMembersListTitle()}
                        </div>
                        <div style={{...styles.row, ...styles.w100}}>
                            <TextField
                                hintText='Search for a member...'
                                underlineShow={true}
                                fullWidth={true}
                                style={styles.textField}
                                onChange={(event) => this.handleOnChange(event)}
                            />
                        </div>
                    </div>
                </div>
                <div style={styles.scrollableDiv}>
                    {this.getList()}
                </div>
            </div>
        );
    }
}

class Member extends React.Component {
    handleAvatarBackground = () => {
        return (this.props.online) ? {background: 'rgb(66, 66, 66)'} : {background: 'rgba(66, 66, 66, 0.54)'}
    };

    handleFontColor = () => {
        return (this.props.online) ? {color: 'rgb(66, 66, 66)'} : {color: 'rgba(66, 66, 66, 0.54)'}
    };

    render() {
        const isBanned = this.props.isBanned;

        return (
            <div style={{...styles.row, ...(!this.props.isLastMember) ? styles.spacing.member : null}}>
                <div style={{...styles.column, ...styles.w100}}>
                    <div style={{...styles.row, ...this.handleFontColor(), ...styles.alignment, ...styles.spacing.row}}>
                        <div style={{...styles.row, ...styles.w100, ...styles.alignment}}>
                            <div style={{...styles.column, ...styles.spacing.avatar}}>
                                <Avatar style={this.handleAvatarBackground()}>{this.props.user.fullName.charAt(0).toUpperCase()}</Avatar>
                            </div>
                            <div style={styles.column}>
                                {this.props.user.fullName}
                            </div>
                        </div>
                        <div style={{...styles.column, ...styles.w100, ...{textAlign: 'center'}}}>
                            {(isBanned) ? 'Banned' : this.props.role}
                        </div>
                        <div style={{...styles.column, ...styles.w100, ...{textAlign: 'center'}}}>
                            {(isBanned) ? 'Unknown' : (this.props.online) ? 'Online' : 'Offline'}
                        </div>
                        {(this.props.isAdmin) && <div style={{...styles.column, ...styles.w100}}>
                            <FlatButton
                                label={(isBanned) ? 'Unban' : 'Ban'}
                                disabled={this.props.role === 'Administrator'}
                                primary={true}
                                labelStyle={(this.props.role !== 'Administrator') ? styles.button.ban : null}
                                onClick={() => {this.props.handleBan(this.props.user.uid, (isBanned) ? 'unban' : 'ban')}}
                            />
                        </div>}
                    </div>
                </div>
            </div>
        );
    }
}