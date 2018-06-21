import React from 'react';
import {Card} from 'material-ui/Card';

import ProgressBar from '../../components/progressBar/ProgressBar';
import Loading from './components/loading/Loading';
import SignIn from './components/signIn/SignIn';
import User from './components/user/User';

const styles = ({
    leftContentContainer: {
        display: 'flex',
        flexBasis: '40%',
        sidebarContainer: {
            height: '100%',
            width: '100%',
            borderRadius: '0',
            sidebar: {
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                content: {
                    padding: '30px 9% 0'
                },
                contentCentered: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '30px 9% 0'
                }
            }
        },
        sidebarContainerOverride: {
            height: '100%',
        }
    },
    leftContentContainerThin: {
        display: 'flex',
        flexBasis: '25%'
    }
});

export default class Sidebar extends React.Component {
    constructor() {
        super();

        this.state = {
            progressBar: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            progressBar: nextProps.state.loading
        });
    }

    handleProgressBar = () => {
        this.setState({
            progressBar: !this.state.progressBar
        })
    };

    render() {
        const state = this.props.state;
        let sidebar = null;

        if (state.loading) {
            sidebar = [
                <div style={styles.leftContentContainer.sidebarContainer.sidebar.contentCentered} key={1}>
                    <Loading subHeading={(!state.signedIn) ? 'Loading...' : 'Signing out...'}/>
                </div>
            ];
        }
        else if (state.signedIn) {
            sidebar = <User user={state.user}
                            groups={state.groups}
                            messages={state.messages}
                            tabs={state.tabs}
                            handleTabChange={this.props.handleTabChange}
                            handleSelectedItem={this.props.handleSelectedItem}
                            signOut={this.props.signOut}
                            handleError={this.props.handleError}
            />;
        }
        else {
            sidebar = [
                <div style={styles.leftContentContainer.sidebarContainer.sidebar.content} key={1}>
                    <SignIn progressBar={this.handleProgressBar}/>
                </div>
            ];
        }

        return (
            <div style={(state.signedIn && !state.loading) ? styles.leftContentContainerThin : styles.leftContentContainer}>
                <Card
                    containerStyle={styles.leftContentContainer.sidebarContainerOverride}
                    style={styles.leftContentContainer.sidebarContainer}
                >
                    <div style={styles.leftContentContainer.sidebarContainer.sidebar}>
                        {((this.state.progressBar && state.loading) || this.state.progressBar) ? <ProgressBar/> : null}
                        {sidebar}
                    </div>
                </Card>
            </div>
        );
    }
}