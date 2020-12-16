import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import logo from './logo.svg';

import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';

//import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import { logout } from './actions/loginActions';

import isEmpty from 'lodash.isempty';

import Divider from 'material-ui/Divider';


//import Notifier from './stuff/Notifier';


class NavigationBar extends React.Component {


  logout(e) {
    e.preventDefault();
    this.props.logout();
  }


  render() {
    let { isAuthenticated } = false;
    let { username } = '';
    if (!isEmpty(sessionStorage.jwToken)) {
      let { auth } = this.props;
      isAuthenticated = auth[0];
      username = auth[0].user.username;
    } else {
      isAuthenticated = false;
      username = '';
    }

    const AdminLinks = (
      <ul className="nav navbar-nav navbar-right">

        <li><Link to="/admin">Администрирование  &nbsp; &nbsp;</Link>

          <Link to="/reports">Отчеты  &nbsp; &nbsp;</Link>
          <Link to="/charts">Графики  &nbsp; &nbsp;</Link>
          <Link to="/stats">Статистика  &nbsp; &nbsp;</Link>
          <Link to="/meteo">Метеоданные  &nbsp; &nbsp;</Link>
          <Link to="/tables">Таблицы  &nbsp; &nbsp;</Link>
          <a href = "https://map.gpshome.ru/main/index.php?login=mosoblecomon&password=mosoblecomon" target="_blank">Карты</a>

          <a href="#" onClick={this.logout.bind(this)}>   Выход</a></li>
      </ul>
    );

    const userLinks = (
      <ul className="nav navbar-nav navbar-right">
        <li><Link to="/reports">Отчеты  &nbsp; &nbsp;</Link>
          <Link to="/charts">Графики  &nbsp; &nbsp;</Link>
          <Link to="/stats">Статистика  &nbsp; &nbsp;</Link>
          <Link to="/meteo">Метеоданные  &nbsp; &nbsp;</Link>
          <Link to="/tables">Таблицы  &nbsp; &nbsp;</Link>
          <a href = "https://map.gpshome.ru/main/index.php?login=mosoblecomon&password=mosoblecomon" target="_blank">Карты</a>


          <a href="#" onClick={this.logout.bind(this)}>   Выход</a></li>
      </ul>
    );

    const guestLinks = (
      <ul className="nav navbar-nav navbar-right">
        <li><Link to="/signup">Регистрация</Link>{"           "}
          <Link to="/login">Войти</Link></li>
      </ul>
    );
    return (
      <div>
        <CssBaseline />
        <div className="App App-header">
          <img src={logo} className="App-logo" alt="Data visualizer" />
          <h3 className="">Визуализация газоаналитических данных </h3>
        </div>
        <nav className="navbar App-navbar">

          <div className="container-fluid">
            <div className="navbar-header">

              <Link to="/" className="navbar-text">{isAuthenticated ? ("Пользователь: " + username) : "Не авторизовано"}</Link>
            </div>

            <div className="navbar-text">

              {isAuthenticated && (username == 'admin') ? AdminLinks : (isAuthenticated ? userLinks : guestLinks)}



            </div>
          </div>

        </nav>

        <Divider />

      </div >

    );
  }
}

NavigationBar.propTypes = {

  logout: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return { auth: state.auth };
}



export default connect(mapStateToProps, { logout })(NavigationBar);
//export default (NavigationBar);           <Link to="/maps">Карты  &nbsp; &nbsp;</Link>
