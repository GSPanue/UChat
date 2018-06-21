import React from 'react';
import Avatar from 'material-ui/Avatar';
import {CardHeader} from 'material-ui/Card';
import {grey100, grey800} from 'material-ui/styles/colors';

import Menu from './components/menu/Menu';

const styles = ({
    container: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0'
    },
    profile: {
        display: 'flex',
        padding: '16px 0px 16px 0px',
        backgroundColor: '#ffffff',
        overflowX: 'hidden',
        marginLeft: '22px'
    },
    title: {
        paddingTop: '2px',
        fontSize: '18px',
        fontWeight: '400',
        color: {
            color: grey800
        }
    },
    subtitle: {
        fontSize: '14px',
        fontWeight: '300'
    },
    avatar: {
        height: '40px',
        width: '40px',
        marginTop: '4px',
        color: grey100,
        backgroundColor: 'rgb(91, 134, 229)'
    },
    divider: {
        margin: '0px 0px 0px',
        height: '1px',
        border: 'none',
        backgroundColor: 'rgb(224, 224, 224)'
    }
});

export default class Profile extends React.Component {
    render() {
        return (
            <div>
                <div style={styles.container}>
                    <CardHeader
                        style={styles.profile}
                        titleStyle={styles.title}
                        titleColor={styles.title.color.color}
                        title={this.props.user.fullName}
                        subtitleStyle={styles.subtitle}
                        subtitle={this.props.user.emailAddress}
                        avatar={<Avatar style={styles.avatar}>{this.props.user.firstName.charAt(0).toUpperCase()}</Avatar>}
                    />
                    <Menu
                        user={this.props.user}
                        handleError={this.props.handleError}
                        signOut={this.props.signOut}
                    />
                </div>
                <hr style={styles.divider}/>
            </div>
        );
    }
}