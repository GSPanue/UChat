import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import {Scrollbars} from 'react-custom-scrollbars';
import GroupIcon from 'material-ui/svg-icons/social/group';
import GroupAddIcon from 'material-ui/svg-icons/social/group-add';

import Groups from './components/groups/Groups';
import Options from './components/options/Options';

const styles = ({
    inkBar: {
        height: '1px',
        marginTop: '-1px'
    },
    tabs: {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 77px)',
    },
    scrollableDiv: {
        height: 'calc(100vh - 48px - 77px)',
        overflowY: 'auto'
    },
    divider: {
        margin: '-1px 0px 0px',
        height: '1px',
        border: 'none',
        backgroundColor: 'rgb(224, 224, 224)',
        zIndex: '-1'
    }
});

export default class TabBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: (this.props.tabs.isOptionsTab) ? 1 : 0
        }
    }

    componentWillReceiveProps(nextProps) {
        const isOptionsTab = nextProps.tabs.isOptionsTab;

        this.setState({
            value: (isOptionsTab) ? 1 : 0
        });
    }

    handleChange = (value) => {
        this.props.handleTabChange(value === 1);
    };

    render() {
        return (
            <Tabs
                value={this.state.value}
                style={styles.tabs}
                onChange={this.handleChange}
                inkBarStyle={styles.inkBar}
            >
                {(this.props.groups !== null) ? <Tab icon={<GroupIcon/>} value={0}>
                    <hr style={styles.divider}/>
                    <div style={styles.scrollableDiv}>
                        <Scrollbars autoHide={true} autoHideDuration={800}>
                            <Groups
                                user={this.props.user}
                                groups={this.props.groups}
                                tabs={this.props.tabs}
                                messages={this.props.messages}
                                handleSelectedItem={this.props.handleSelectedItem}
                            />
                        </Scrollbars>
                    </div>
                </Tab> : false}
                <Tab icon={<GroupAddIcon/>} value={1}>
                    <hr style={styles.divider}/>
                    <div style={styles.scrollableDiv}>
                        <Scrollbars autoHide={true} autoHideDuration={800}>
                            <Options
                                tabs={this.props.tabs}
                                progressBar={this.props.progressBar}
                                handleSelectedItem={this.props.handleSelectedItem}
                            />
                        </Scrollbars>
                    </div>
                </Tab>
            </Tabs>
        );
    }
}