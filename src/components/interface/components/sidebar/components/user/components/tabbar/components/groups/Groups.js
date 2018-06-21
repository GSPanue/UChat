import React from 'react';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import SelectedIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import {grey100} from 'material-ui/styles/colors';

const styles = ({
    selectedItem: {
        backgroundColor: grey100
    },
    group: {
        padding: '0px',
        item: {
            fontSize: '17px',
            innerDivStyle: {
                marginLeft: '6px'
            },
            avatar: {
                backgroundColor: 'rgb(91, 134, 229)'
            },
            secondaryText: {
                whiteSpace: 'normal'
            }
        }
    },
    selectedContainer: {
        marginRight: '8px',
        selected: {
            fill: 'rgb(91, 134, 229)'
        }
    }
});

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
    return class SelectableList extends React.Component {
        componentWillMount() {
            this.setState({
                selectedIndex: this.props.defaultValue,
            });
        }

        componentWillReceiveProps(nextProps) {
            this.setState({
                selectedIndex: nextProps.defaultValue
            });
        }

        handleRequestChange = (event, index) => {
            this.setState({
                selectedIndex: index,
            });
        };

        render() {
            return (
                <ComposedComponent
                    style={styles.group}
                    selectedItemStyle={styles.selectedItem}
                    value={this.state.selectedIndex}
                    onChange={this.handleRequestChange}
                >
                    {this.props.children}
                </ComposedComponent>
            );
        }
    };
}

SelectableList = wrapState(SelectableList);

export default class Groups extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: this.props.tabs.selectedOnTabA
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            selected: nextProps.tabs.selectedOnTabA
        });
    }

    handleOnClick = (ref) => {
        this.props.handleSelectedItem(ref.props.value);
    };

    getLatestMessage = (id) => {
        if (this.props.messages !== null && this.props.messages[id] !== undefined) {
            const messages = this.props.messages[id];
            const latestMessage = messages[Object.keys(messages)[Object.keys(messages).length - 1]];
            const isClient = (this.props.user.uid === latestMessage.user.uid);

            let message = '';

            if (latestMessage.type === 'notification') {
                if (latestMessage.message === 'banned') {
                    message = ((isClient) ? 'You' : latestMessage.user.firstName) + ' was banned from the group';
                }
                else {
                    message = ((isClient) ? 'You' : latestMessage.user.firstName)
                        + ' ? the group'.replace('?', latestMessage.message);
                }
            }
            else if (latestMessage.type === 'message') {
                message = ((isClient) ? 'You' : latestMessage.user.firstName) + ': ' + latestMessage.message;
            }

            return message;
        }
    };

    render() {
        const selected = <div style={styles.selectedContainer}>
            <SelectedIcon style={styles.selectedContainer.selected}/>
        </div>;

        return (
            <SelectableList defaultValue={this.state.selected}>
                {(this.props.groups !== null) ? this.props.groups.map((element, index) => [
                    <ListItem
                        innerDivStyle={styles.group.item.innerDivStyle}
                        value={(index + 1)}
                        ref={(index + 1)}
                        leftAvatar={<Avatar style={styles.group.item.avatar}>{element.title.charAt(0).toUpperCase()}</Avatar>}
                        primaryText={element.title}
                        secondaryText={<div style={styles.group.item.secondaryText}>{this.getLatestMessage(element.id)}</div>}
                        rightIcon={(this.state.selected === (index + 1)) ? selected : null}
                        style={styles.group.item}
                        onClick={() => this.handleOnClick(this.refs[(index + 1)])}
                    />
                ]) : false}
            </SelectableList>
        );
    }
}