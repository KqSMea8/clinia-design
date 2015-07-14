'use strict';

import React from 'react';
import jQuery from 'jquery';
import Table from 'rc-table';
import Menu from 'rc-menu';
import Dropdown from '../dropdown';
import Pagination from '../pagination';

let AntTable = React.createClass({
  getInitialState() {
    // 支持两种模式
    if (Array.isArray(this.props.dataSource)) {
      this.mode = 'local';
      // 保留原来的数据
      this.originDataSource = this.props.dataSource.slice(0);
    } else {
      this.mode = 'remote';
      this.props.dataSource.resolve =
        this.props.dataSource.resolve || function(data) {
          return data || [];
        };
      this.props.dataSource.getParams =
        this.props.dataSource.getParams || function() {
          return {};
        };
      this.props.dataSource.getPagination =
        this.props.dataSource.getPagination || function() {
          return {};
        };
    }
    var pagination;
    if (this.props.pagination === false) {
      pagination = false;
    } else {
      pagination = this.props.pagination || {};
      pagination.current = pagination.current || 1;
      pagination.pageSize = pagination.pageSize || 10;
    }
    return {
      selectedRowKeys: [],
      loading: false,
      selectedFilters: [],
      pagination: pagination,
      data: []
    };
  },
  getDefaultProps() {
    return {
      prefixCls: 'ant-table',
      useFixedHeader: false,
      rowSelection: null,
      size: 'normal'
    };
  },
  renderMenus(items) {
    let menuItems = items.map((item) => {
      return <Menu.Item key={item.value}>{item.text}</Menu.Item>;
    });
    return menuItems;
  },
  toggleSortOrder(order, column) {
    if (column.sortOrder === order) {
      column.sortOrder = '';
    } else {
      column.sortOrder = order;
    }
    if (this.mode === 'local') {
      let sorter = function() {
        let result = column.sorter.apply(this, arguments);
        if (column.sortOrder === 'ascend') {
          return result;
        } else if (column.sortOrder === 'descend') {
          return -result;
        }
      };
      if (column.sortOrder) {
        this.props.dataSource = this.props.dataSource.sort(sorter);
      } else {
        this.props.dataSource = this.originDataSource.slice();
      }
    }
    this.fetch();
  },
  handleFilter(column) {
    this.props.dataSource = this.originDataSource.slice().filter(function(record) {
      if (column.selectedFilters.length === 0) {
        return true;
      }
      return column.selectedFilters.some(function(value) {
        var result = column.onFilter.call(this, value, record);
        return result;
      });
    });
    this.fetch();
  },
  handleSelectFilter(column, selected) {
    column.selectedFilters = column.selectedFilters || [];
    column.selectedFilters.push(selected);
  },
  handleDeselectFilter(column, key) {
    column.selectedFilters = column.selectedFilters || [];
    var index = column.selectedFilters.indexOf(key);
    if (index !== -1) {
      column.selectedFilters.splice(index, 1);
    }
  },
  handleSelect(e) {
    let checked = e.currentTarget.checked;
    let currentRowIndex = e.currentTarget.parentElement.parentElement.rowIndex;
    let selectedRow = this.state.data[currentRowIndex - 1];
    if (checked) {
      this.state.selectedRowKeys.push(currentRowIndex);
    } else {
      this.state.selectedRowKeys = this.state.selectedRowKeys.filter(function(i){
        return currentRowIndex !== i;
      });
    }
    this.setState({
      selectedRowKeys: this.state.selectedRowKeys
    });
    if (this.props.rowSelection.onSelect) {
      this.props.rowSelection.onSelect(selectedRow, checked);
    }
  },
  handleSelectAllRow(e) {
    let checked = e.currentTarget.checked;
    this.setState({
      selectedRowKeys: checked ? this.state.data.map(function(item, i) {
        return i + 1;
      }) : []
    });
    if (this.props.rowSelection.onSelectAll) {
      this.props.rowSelection.onSelectAll(checked);
    }
  },
  handlePageChange: function(current) {
    let pageSize = this.state.pagination.pageSize;
    this.setState({
      data: this.props.dataSource.filter(function(item, i) {
        if (i >= (current - 1) * pageSize &&
            i < current * pageSize) {
          return item;
        }
      })
    });
  },
  renderSelectionCheckBox(value, record, index) {
    let checked = this.state.selectedRowKeys.indexOf(index + 1) >= 0;
    let checkbox = <input type="checkbox" checked={checked} onChange={this.handleSelect} />;
    return checkbox;
  },
  renderRowSelection() {
    var columns = this.props.columns;
    if (this.props.rowSelection) {
      let checked = this.state.data.every(function(item, i) {
        return this.state.selectedRowKeys.indexOf(i + 1) >= 0;
      }, this);
      let checkboxAll = <input type="checkbox" checked={checked} onChange={this.handleSelectAllRow} />;
      let selectionColumn = {
        key: 'selection-column',
        title: checkboxAll,
        width: 60,
        render: this.renderSelectionCheckBox
      };
      if (columns[0] &&
          columns[0].key === 'selection-column') {
        columns[0] = selectionColumn;
      } else {
        columns.unshift(selectionColumn);
      }
    }
    return columns;
  },
  renderColumnsDropdown() {
    return this.props.columns.map((column) => {
      if (!column.originTitle) {
        column.originTitle = column.title;
      }
      let filterDropdown, menus, sortButton;
      if (column.filters && column.filters.length > 0) {
        menus = <Menu multiple={true}
          className="ant-table-filter-dropdown"
          onSelect={this.handleSelectFilter.bind(this, column)}
          onDeselect={this.handleDeselectFilter.bind(this, column)}>
          {this.renderMenus(column.filters)}
          <Menu.Item disabled>
            <button style={{
                cursor: 'pointer',
                pointerEvents: 'visible'
              }}
              className="ant-btn ant-btn-primary ant-btn-sm"
              onClick={this.handleFilter.bind(this, column)}>
              确 定
            </button>
          </Menu.Item>
        </Menu>;
        let dropdownSelectedClass = '';
        if (column.selectedFilters && column.selectedFilters.length > 0) {
          dropdownSelectedClass = 'ant-table-filter-selected';
        }
        filterDropdown = <Dropdown trigger="click"
          closeOnSelect={false}
          overlay={menus}>
          <i title="筛选" className={'anticon anticon-bars ' + dropdownSelectedClass}></i>
        </Dropdown>;
      }
      if (column.sorter) {
        sortButton = <div className="ant-table-column-sorter">
          <span className={'ant-table-column-sorter-up ' +
                           (column.sortOrder === 'ascend' ? 'on' : 'off')}
            title="升序排序"
            onClick={this.toggleSortOrder.bind(this, 'ascend', column)}>
            <i className="anticon anticon-caret-up"></i>
          </span>
          <span className={'ant-table-column-sorter-down ' +
                           (column.sortOrder === 'descend' ? 'on' : 'off')}
            title="降序排序"
            onClick={this.toggleSortOrder.bind(this, 'descend', column)}>
            <i className="anticon anticon-caret-down"></i>
          </span>
        </div>;
      }
      column.title = [
        column.originTitle,
        sortButton,
        filterDropdown
      ];
      return column;
    });
  },
  renderPagination() {
    // 强制不需要分页
    if (this.state.pagination === false) {
      return '';
    }
    return <Pagination className="ant-table-pagination"
      onChange={this.handlePageChange}
      {...this.state.pagination} />;
  },
  fetch: function() {
    let dataSource = this.props.dataSource;
    if (this.mode === 'remote') {
      this.setState({
        loading: true
      });
      jQuery.ajax({
        url: dataSource.url,
        params: dataSource.getParams(),
        success: (result) => {
          if (this.isMounted()) {
            this.setState({
              data: dataSource.resolve.call(this, result),
              pagination: dataSource.getPagination.call(this, result)
            });
          }
        },
        complete: () => {
          this.setState({
            loading: false
          });
        }
      });
    } else {
      this.handlePageChange(this.state.pagination.current);
    }
  },
  componentDidMount() {
    this.fetch();
  },
  render() {
    this.props.columns = this.renderRowSelection();

    var classString = '';
    if (this.props.loading) {
      classString += ' ant-table-loading';
    }
    if (this.props.size === 'small') {
      classString += ' ant-table-small';
    }

    return <div className="clearfix">
      <Table data={this.state.data}
      columns={this.renderColumnsDropdown()}
      className={classString}
      {...this.props} />
      {this.renderPagination()}
    </div>;
  }
});

export default AntTable;
