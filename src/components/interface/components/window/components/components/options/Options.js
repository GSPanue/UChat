import React from 'react';
import Subheader from 'material-ui/Subheader';
import {List} from 'material-ui/List';
import {grey800} from 'material-ui/styles/colors';

import JoinGroup from './components/JoinGroup';
import CreateGroup from './components/CreateGroup';

const styles = ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: '6 1 0',
        alignItems: 'center',
        innerDiv: {
            height: '100%',
            width: '50%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        },
        listContainer: {
            width: '100%',
            list: {
                padding: '0'
            }
        }
    },
    subHeader: {
        lineHeight: 'normal',
        paddingLeft: '21px',
        fontSize: '16px',
        color: grey800
    },
});

export default class Options extends React.Component {
    render() {
        return (
            <div style={styles.container}>
                <div style={styles.container.innerDiv}>

                    <div style={styles.container.listContainer}>
                        <List style={styles.container.listContainer.list}>
                            <Subheader style={styles.subHeader}>{this.props.selectedOnTabB === 1 ? 'Find a Group' : 'Create a Group'}</Subheader>
                            {(this.props.selectedOnTabB === 1) ? <JoinGroup
                                user={this.props.user}
                                groups={this.props.groups}
                                progressBar={this.props.progressBar}
                                handleTabChange={this.props.handleTabChange}
                                handleError={this.props.handleError}
                            /> : <CreateGroup
                                user={this.props.user}
                                progressBar={this.props.progressBar}
                                handleTabChange={this.props.handleTabChange}
                                handleError={this.props.handleError}
                            />}
                        </List>
                    </div>

                </div>
            </div>
        );
    }
}