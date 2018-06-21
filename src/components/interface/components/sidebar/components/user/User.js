import React from 'react';
import Profile from './components/profile/Profile';
import TabBar from './components/tabbar/TabBar';

export default class User extends React.Component {
    render() {
        return (
            <div>
                <Profile
                    user={this.props.user}
                    handleError={this.props.handleError}
                    signOut={this.props.signOut}
                />
                <TabBar
                    user={this.props.user}
                    groups={this.props.groups}
                    messages={this.props.messages}
                    tabs={this.props.tabs}
                    handleTabChange={this.props.handleTabChange}
                    handleSelectedItem={this.props.handleSelectedItem}
                />
            </div>
        );
    }
}