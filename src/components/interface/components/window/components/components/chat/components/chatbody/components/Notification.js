import React from 'react';

const styles = ({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        margin: '20px 0 0',
        alignItems: 'center',
        innerDiv: {
            background: 'rgb(91, 134, 229)',
            padding: '5px 20px',
            borderRadius: '50px',
            notification: {
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '400'
            }
        },
        lastMessage: {
            marginBottom: '20px'
        }
    }
});

export default class Notification extends React.Component {
    render() {
        const isDate = (this.props.date);
        let notification = '';

        if (isDate) {
            notification = this.props.notification;
        }
        else {
            notification = this.props.name;

            if (this.props.notification === 'banned') {
                notification += ' was banned from the group';
            }
            else {
                const hasJoined = this.props.notification === 'joined';

                notification += (' ? the group').replace('?', ((hasJoined) ? 'joined' : 'left'));
            }
        }

        return (
            <div style={{...styles.container, ...(this.props.isLastMessage) ? styles.container.lastMessage : null}}>
                <div style={styles.container.innerDiv}>
                    <span style={styles.container.innerDiv.notification}>
                        {notification}
                    </span>
                </div>
            </div>
        );
    }
}