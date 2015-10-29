import React from 'react';
import Animate from 'rc-animate';
import Icon from '../iconfont';

const prefixCls = 'ant-upload';

export default React.createClass({
  getDefaultProps() {
    return {
      items: []
    };
  },

  handleClose(file) {
    this.props.onRemove(file);
  },

  render() {
    let list = this.props.items.map((file) => {
      let statusIcon = file.status === 'done' ?
        <Icon type="check" className={prefixCls + '-success-icon'} /> :
        <Icon type="loading" />;
      let filename = file.url ?
        <a className={prefixCls + '-item-name'} href={file.url} target="_blank">{file.name}</a> :
        <b className={prefixCls + '-item-name'}>{file.name}</b>;
      return (
        <div className={prefixCls + '-list-item'} key={file.uid}>
          {statusIcon}
          {filename}
          <Icon type="cross" ref="thisCloseBtn" onClick={this.handleClose.bind(this, file)} />
        </div>
      );
    });
    return <div className={prefixCls + '-list'}>
      <Animate transitionName={prefixCls + '-margin-top'}>
        {list}
      </Animate>
    </div>;
  }
});
