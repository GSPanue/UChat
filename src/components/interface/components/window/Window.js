import React from 'react';
import Chat from './components/components/chat/Chat';
import Options from './components/components/options/Options';

const styles = ({
    window: {
        display: 'flex',
        flexBasis: '60%',
        background: '#36D1DC',
        background: '-webkit-linear-gradient(to right, #5B86E5, #36D1DC)',
        background: 'linear-gradient(to right, #5B86E5, #36D1DC)',
    }
});

export default class Window extends React.Component {
    render() {
        const state = this.props.state;

        if ((!state.signedIn && !state.loading) || state.loading) {
            return <div style={styles.window}></div>;
        }
        else if (state.tabs.isOptionsTab) {
            return <Options
                user={state.user}
                groups={state.groups}
                selectedOnTabB={state.tabs.selectedOnTabB}
                handleTabChange={this.props.handleTabChange}
                handleError={this.props.handleError}
            />;
        }
        else {
            return <Chat
                user={state.user}
                groups={state.groups}
                messages={state.messages}
                tabs={state.tabs}
                handleSendMessage={this.props.handleSendMessage}
                handleMessagesUpdate={this.props.handleMessagesUpdate}
                handleLeaveGroup={this.props.handleLeaveGroup}
                handleDeleteGroup={this.props.handleDeleteGroup}
                handleError={this.props.handleError}
            />;
        }
    }
}