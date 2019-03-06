import React, { Component } from 'react';

import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import format from 'node.date-time';


import MenuTable from './menuTable';

import FontIcon from 'material-ui/FontIcon';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
import SensorsIcon from 'material-ui/svg-icons/action/settings-input-component';
import StationsIcon from 'material-ui/svg-icons/action/account-balance';
import DataIcon from 'material-ui/svg-icons/action/timeline';
import IconButton from 'material-ui/IconButton';
import Renew from 'material-ui/svg-icons/action/autorenew';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/core/Slide';
import Switch from '@material-ui/core/Switch';
import SvgIcon from '@material-ui/core/SvgIcon';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import Typography from '@material-ui/core/Typography';


import shortid from 'shortid';
import isEmpty from 'lodash.isempty';
import toUpper from 'lodash/toUpper';
import isNumber from 'lodash.isnumber';

import L from 'leaflet';
import { LeafIcon } from 'leaflet';
import worldGeoJSON from 'geojson-world-map';
import './map-widget.css';
import "leaflet/dist/leaflet.css";
import marker from 'leaflet/src/images/marker.svg';

import { getStationsList } from './actions/stationsGetAction';
import { queryEvent, queryOperativeEvent } from './actions/queryActions';

const pngs = require.context('../../tiles', true, /\.png$/);
//const keys = pngs.keys();

//const pngsArray = keys.map(key => pngs(key));

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    map: {
        height: '400px'
    }


});

const outer = [[50.505, -29.09], [52.505, 29.09]]
const inner = [[49.505, -2.09], [53.505, 2.09]]



function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
};


class MapsForm extends React.Component {
    constructor(props) {
        super(props);
        const {

            chartData,
            stationsList,
            sensorsList,
        } = props;

        let today = new Date();
        today -= 1200000;//20 min in milliseconds

        this.state = {
            title: '',
            snack_msg: '',
            errors: {},
            bounds: outer,
            stationsList,
            dateTimeBegin: new Date(today).format('Y-MM-ddTHH:mm'),
            dateTimeEnd: new Date().format('Y-MM-ddTHH:mm'),
        };


    }

    static defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
        locations: ''
    };


    onClickInner = () => {
        this.setState({ bounds: inner })
    }

    onClickOuter = () => {
        this.setState({ bounds: outer })
    }


    handleChange = (event, tab_no) => {
        this.setState({ tab_no });
    };


    onClickReset = () => {
        this.setState({ viewport: DEFAULT_VIEWPORT })
    }

    onViewportChanged = (viewport) => {
        this.setState({ viewport })
    }

    componentDidMount() {
        const { stationsList } = this.props;
        let params = {};
        this.props.queryEvent(params).then(data => {
            let lat, lng = 0;
            let params = {};
            params.period_from = this.state.dateTimeBegin;
            params.period_to = this.state.dateTimeEnd;

            getStationsList(data);

            if (!isEmpty(data)) {
                lat = data[0].latitude;
                lng = data[0].longitude;
            }
            var lmap = L.map('mapBox', { center: [lat, lng], zoom: 10 });
            L.tileLayer("./tiles/{z}/{x}/{y}.png", {}).addTo(lmap);
            //var greenIcon = new LeafIcon({iconUrl: 'leaf-green.png'});
            data.map(item => {
                let marker = L.marker([item.latitude, item.longitude], { title: item.namestation + "\n" + item.place, opacity: 0.5 }).addTo(lmap);
                params.station = item.id;
                this.props.queryOperativeEvent(params).then(values => {
                    if (values) {
                        let dataList = values.dataTable;
                        let sensorsList = values.sensorsTable;
                        let macsList = values.macsTable;
                        let rows_measure = [];
                        let popupContent = "";

                        macsList.forEach((element, indx) => {
                            let filter = dataList.filter((item, i, arr) => {
                                return item.typemeasure == element.chemical;
                            });
                            let sum = 0;
                            let counter = 0;
                            let class_css;
                            let quotient = 0;
                            let range_macs = 0; // range of macs surplus


                            if (!isEmpty(filter)) {
                                filter.forEach(item => {
                                    sum += item.measure;
                                    counter++;
                                });
                                quotient = (sum / counter);
                                range_macs = quotient / element.max_m;
                                class_css = 'alert_success';

                                if (range_macs > 1)
                                    class_css = 'alert_macs1_ylw'; //outranged of a macs in 1 time
                                if (range_macs >= 5)
                                    class_css = 'alert_macs5_orng'; //outranged of a macs in 5 times
                                if (range_macs >= 10)
                                    class_css = 'alert_macs10_red'; //outranged of a macs in  more than 10 times


                                rows_measure.push({
                                    'chemical': element.chemical + ', мг/м.куб.', 'macs': element.max_m,
                                    'date': new Date(filter[filter.length - 1].date_time).format('dd-MM-Y'),
                                    'time': new Date(filter[filter.length - 1].date_time).format('H:mm:SS'), 'value': quotient.toFixed(6), 'className': class_css
                                })
                                popupContent += element.chemical + " : " + quotient.toFixed(6) + "\n";
                            };
                        });
                        marker.bindPopup(popupContent, { autoClose: false });
                    }
                });
            })
        });
    }




    render() {
        const { toggleSelection, toggleAll, isSelected } = this;
        const { selection, selectAll, stationsList } = this.state;
        const { loadData } = this.props;
        const { classes } = this.props;
        const { sensorsList } = this.props;
        const { tab_no } = this.state;



        return (


            <Paper className={classes.root}>
                <script src="leaflet/leaflet.js"></script>
                <Tabs>

                    <Tab label="Карта постов наблюдения" >
                        <div id='container'>
                            <div id='mapBox' />
                        </div>

                    </Tab>

                </Tabs>

            </Paper >
        );
    }
}

function mapStateToProps(state) {

    return {
        stationsList: state.stationsList,
    };
}


MapsForm.propTypes = {
    classes: PropTypes.object.isRequired,

    //loadData: PropTypes.func.isRequired
}

MapsForm.contextType = {
    // router: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { queryEvent, queryOperativeEvent })(withRouter(withStyles(styles)(MapsForm)));