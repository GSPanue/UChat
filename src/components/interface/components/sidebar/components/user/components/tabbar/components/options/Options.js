import React from 'react';
import {List, ListItem, makeSelectable} from 'material-ui/List';
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

export default class Options extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: this.props.tabs.selectedOnTabB
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            selected: nextProps.tabs.selectedOnTabB
        });
    }

    handleOnClick = (ref) => {
        this.props.handleSelectedItem(ref.props.value);
    };

    render() {
        const selected = <div style={styles.selectedContainer}>
            <SelectedIcon style={styles.selectedContainer.selected}/>
        </div>;

        return (
            <SelectableList defaultValue={this.state.selected}>
                <ListItem
                    innerDivStyle={styles.group.item.innerDivStyle}
                    value={1}
                    ref={1}
                    primaryText='Find a Group'
                    secondaryText='Find and join a group'
                    rightIcon={(this.state.selected === 1) ? selected : null}
                    style={styles.group.item}
                    onClick={() => this.handleOnClick(this.refs[1])}
                />
                <ListItem
                    innerDivStyle={styles.group.item.innerDivStyle}
                    value={2}
                    ref={2}
                    primaryText='Create a Group'
                    secondaryText='Create your own group'
                    rightIcon={(this.state.selected === 2) ? selected : null}
                    style={styles.group.item}
                    onClick={() => this.handleOnClick(this.refs[2])}
                />
            </SelectableList>
        );
    }
}