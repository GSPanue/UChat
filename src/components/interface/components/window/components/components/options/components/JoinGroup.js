import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import validator from 'validator';
import AddIcon from 'material-ui/svg-icons/content/add-circle';

const database = require('~/database/database');
const debounce = require('lodash.debounce');

const styles = ({
   container: {
       display: 'flex',
       flexDirection: 'row',
       autoComplete: {
           padding: '0 0 0 22px'
       },
       submit: {
           marginRight: '7px',
           icon: {
               color: 'rgb(91, 134, 229)'
           }
       }
   }
});

let groups = [];

export default class JoinGroup extends React.Component {
    constructor() {
        super();

        this.state = {
            searchText: '',
            request: null,
            index: null,
            error: false,
            isJoining: false
        };

        this.dataSourceConfig = {
            text: 'id', value: 'value'
        };
    };

    componentWillUnmount() {
        groups = [];
    };

    handleOnUpdateInput = (text) => {
        text = text.trim().split('/');
        text = text[text.length - 1];

        this.setState({
            searchText: text
        });
    };

    handleRequest = (request, index) => {
        (index > -1) ? this.setState({
            searchText: request.value.props.primaryText,
            request: request,
            index: index
        }) : null;
    };

    handleOnFocus = () => {
        this.reset();
    };

    handleSubmit = () => {
        const join = this.state.request.id;
        const user = this.props.user;

        if (this.state.index !== null) {
            this.setState({
                index: null
            }, () => {
                let groups = (this.props.groups === null) ? [] : this.props.groups;

                let isNotInGroup = (groups.findIndex(group => group.id === join) === -1);

                if (isNotInGroup) {
                    database.joinGroup(user, join, (response) => {
                        if (!response) {
                            this.setState({
                                index: null
                            });

                            this.props.handleError(true);
                        }
                        else if (response.hasOwnProperty('banned') && response['banned']) {
                            this.setState({
                                index: null,
                                error: {
                                    ...this.state.error, value: true, text: 'You were banned from this group.'
                                }
                            });
                        }
                    });
                }
                else {
                    this.setState({
                        index: null,
                        error: {
                            ...this.state.error, value: true, text: 'You\'ve already joined this group.'
                        }
                    });
                }
            });
        }
    };

    reset() {
        this.setState({
            searchText: '',
            request: null,
            index: null,
            open: false,
            error: {
                value: false,
                text: ''
            }
        });
    }

    findGroup = debounce(() => {
        const id = this.state.searchText;

        if (id.length > 0) {
            const isInArray = groups.filter(group => (group.id === id)).length === 1;

            if (!isInArray) {
                if (!validator.matches(id, /[.#$\[\]]+/)) {
                    database.fetchGroup(id, (group) => {
                        if (group !== null) {
                            const value = <MenuItem
                                primaryText={group.title}
                                secondaryText={(group.members.counter === 1) ? group.members.counter + ' member' : group.members.counter + ' members'}
                            />;

                            groups.push({
                                id: id,
                                value: value
                            });

                            this.setState({
                                open: true,
                                error: {
                                    ...this.state.error, value: false, text: ''
                                }
                            });

                            return true;
                        }

                        this.setState({
                            open: false,
                            error: {
                                ...this.state.error,
                                value: true,
                                text: 'We couldn\'t find a group matching this ID. Try again?'
                            }
                        });
                    });
                }
                else {
                    this.setState({
                        open: false,
                        error: {
                            ...this.state.error,
                            value: true,
                            text: 'This isn\'t a valid group ID. Try again?'
                        }
                    });
                }

                return true;
            }

            this.setState({
                open: true,
                error: {
                    ...this.state.error, value: false, text: ''
                }
            });
        }
    }, 500);

    render() {
        return (
            <div style={styles.container}>
                <AutoComplete
                    open={(this.state.searchText.length !== 0) ? this.state.open : false}
                    searchText={this.state.searchText}
                    dataSource={groups}
                    dataSourceConfig={this.dataSourceConfig}
                    hintText='Paste a group link or unique ID...'
                    fullWidth={true}
                    filter={AutoComplete.fuzzyFilter}
                    maxSearchResults={8}
                    openOnFocus={false}
                    style={styles.container.autoComplete}
                    onUpdateInput={(text) => this.handleOnUpdateInput(text)}
                    onFocus={(event) => this.handleOnFocus(event)}
                    onKeyDown={() => this.findGroup()}
                    onBlur={() => {
                        const isInArray = groups.filter(group => (group.id === this.state.searchText)).length === 1;

                        if (!isInArray) {
                            if (this.state.request !== null) {
                                if (this.state.searchText !== this.state.request.value.props.primaryText) {
                                    this.findGroup();
                                }
                            }

                            this.findGroup();
                        }
                    }}
                    onNewRequest={(request, index) => this.handleRequest(request, index)}
                    errorText={(this.state.error.value) ? this.state.error.text : null}
                />
                <IconButton
                    disabled={(this.state.index === null)}
                    onClick={this.handleSubmit}
                    style={styles.container.submit}
                    iconStyle={styles.container.submit.icon}
                >
                    <AddIcon/>
                </IconButton>
            </div>
        );
    }
}