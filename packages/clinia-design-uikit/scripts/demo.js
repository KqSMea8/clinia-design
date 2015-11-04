window['css-animation'] = require('css-animation');
window['react-router'] = require('react-router');
window.Clip = require('react-clip');
var antd = require('../index');
var React = require('react');
var ReactDOM = require('react-dom');
var semver = require('semver');
window.antd = antd;
window.React = React;
window.ReactDOM = ReactDOM;

InstantClickChangeFns.push(function () {
  // auto complete for components
  var Select = antd.Select;
  var Option = Select.Option;
  // 获取搜索数据
  var searchData = window.ANT_COMPONENTS.sort(function (a, b) {
    return a.title.localeCompare(b.title);
  });

  var AutoComplete = React.createClass({
    getOptions() {
      return searchData.map(function (s) {
        return <Option sData={s} key={s.title} text={'跳转到 ' + s.title}>
          <strong>{s.title}</strong>
          &nbsp;
          <span className="ant-component-decs">{s.desc}</span>
        </Option>;
      });
    },

    handleSelect(value) {
      location.href = rootUrl + '/components/' + value.replace(/([a-z])([A-Z])/g, function (m, m1, m2) {
          return m1 + '-' + m2;
        }).toLowerCase() + '/';
    },

    filterOption(input, option) {
      return option.props.sData.title.toLowerCase().indexOf(input.toLowerCase()) !== -1 || option.props.sData.desc.indexOf(input) !== -1;
    },

    render() {
      return <Select combobox style={{width: '100%'}}
                     onSelect={this.handleSelect}
                     optionLabelProp="text"
                     dropdownClassName="autoComplete"
                     searchPlaceholder="搜索组件..."
                     filterOption={this.filterOption}>{this.getOptions()}</Select>;
    }
  });

  ReactDOM.render(<AutoComplete/>, document.getElementById('autoComplete'));
});

InstantClickChangeFns.push(function () {
  var Select = antd.Select;
  var Option = Select.Option;
  var versionsHistory = {
    '0.9.2': '09x.ant.design'
  };
  versionsHistory[antdVersion.latest] =
    versionsHistory[antdVersion.latest] || 'http://ant.design';
  var versions = Object.keys(versionsHistory).sort(function (a, b) {
    return semver.lt(a, b);
  });
  var options = versions.map(function (version) {
    var link = versionsHistory[version];
    return <Option key={version} value={version}>{version}</Option>;
  });

  function onChange(value) {
    if (versionsHistory[value]) {
      location.href = location.href.replace(location.host, versionsHistory[value]);
    }
  }

  ReactDOM.render(
    <Select defaultValue={antdVersion.latest} size="small" style={{width:130}}
            onChange={onChange}>{options}</Select>
  , document.getElementById('versions-select'));
});

module.exports = antd;
