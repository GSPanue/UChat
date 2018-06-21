import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {grey100, grey500, grey800} from 'material-ui/styles/colors';

import Interface from './components/interface/Interface';

const styles = ({
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
    },
    bodyContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: '1'
    }
});

const muiTheme = getMuiTheme({
    palette: {
        textColor: grey800
    },
    appBar: {
        color: grey100,
        textColor: grey800,
        height: '60',
        titleFontWeight: '400'
    },
    stepper: {
        iconColor: grey800
    },
    flatButton: {
        primaryTextColor: 'rgb(91, 134, 229)'
    },
    textField: {
        focusColor: 'rgb(91, 134, 229)',
        floatingLabelColor: grey800
    },
    tabs: {
        backgroundColor: '#ffffff',
        selectedTextColor: 'rgb(91, 134, 229)',
        textColor: grey500
    },
    inkBar: {
        backgroundColor: grey800
    },
    toggle: {
        thumbOnColor: 'rgb(91, 134, 229)',
        trackOnColor: 'rgba(91, 134, 229, 0.78)',
    },
    tooltip: {
        rippleBackgroundColor: grey800
    },
    snackbar: {
        backgroundColor: 'rgb(91, 134, 229)',
        actionColor: '#ffffff'
    }
});

injectTapEventPlugin();

ReactDOM.render(<Router>
    <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.pageContainer}>
            <div style={styles.bodyContainer}>
                <Switch>
                    <Route exact path='/' component={Interface}/>
                    <Route path='/join/:id' render={({match}) =>
                        <Redirect to={{
                            pathname: '/',
                            state: {
                                id: match.params.id
                            }}}
                        />}
                    />
                    <Route render={() => <Redirect to='/'/>}/>
                </Switch>
            </div>
        </div>
    </MuiThemeProvider>
</Router>, document.getElementById('app'));