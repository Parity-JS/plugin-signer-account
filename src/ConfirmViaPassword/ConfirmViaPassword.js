// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import IdentityIcon from '@parity/ui/lib/IdentityIcon';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Input from 'semantic-ui-react/dist/commonjs/elements/Input';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import pick from 'lodash/pick';

import styles from './ConfirmViaPassword.css';

@inject('parityAllAccountsInfoStore')
@observer
@injectIntl
class ConfirmViaPassword extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired
  };

  static propTypes = {
    address: PropTypes.string.isRequired,
    dataSigned: PropTypes.string,
    intl: intlShape,
    isDisabled: PropTypes.bool,
    isFocused: PropTypes.bool,
    request: PropTypes.object.isRequired,
    transaction: PropTypes.object
  };

  state = {
    password: ''
  };

  handleChange = ({ target: { value } }) =>
    this.setState({
      password: value
    });

  handleConfirm = () => {
    const { api } = this.context;
    const { dataSigned, request, transaction } = this.props;
    const { password } = this.state;

    if (dataSigned) {
      api.signer.confirmRequestRaw(request.id, dataSigned);
    } else {
      // Note that transaction can be null, in this case confirmRequest will
      // sign the message that was in the request
      api.signer.confirmRequest(request.id, pick(transaction, ['condition', 'gas', 'gasPrice,']), password);
    }
  };

  render() {
    const { address, isDisabled, request: { isSending } } = this.props;

    return (
      <div className={styles.confirmForm}>
        <Form>
          {this.renderPassword()}
          {this.renderHint()}
          <Button
            className={styles.confirmButton}
            content={
              isSending ? (
                <FormattedMessage id="signer.txPendingConfirm.buttons.confirmBusy" defaultMessage="Confirming..." />
              ) : (
                <FormattedMessage
                  id="signer.txPendingConfirm.buttons.confirmRequest"
                  defaultMessage="Confirm Request"
                />
              )
            }
            disabled={isDisabled || isSending}
            fluid
            icon={<IdentityIcon address={address} button className={styles.signerIcon} />}
            onClick={this.handleConfirm}
          />
        </Form>
      </div>
    );
  }

  renderPassword() {
    const { intl: { formatMessage }, isFocused } = this.props;
    const { password } = this.state;

    return (
      <Input
        focus={isFocused}
        label={
          <FormattedMessage id="signer.txPendingConfirm.password.unlock.label" defaultMessage="Account Password" />
        }
        onChange={this.handleChange}
        placeholder={formatMessage({
          defaultMessage: 'unlock the account',
          id: 'signer.txPendingConfirm.password.unlock.hint'
        })}
        type="password"
        value={password}
      />
    );
  }

  renderHint() {
    const { address } = this.props;
    const account = this.props.parityAllAccountsInfoStore.allAccountsInfo[address];
    const passwordHint = (account && account.meta && account.meta.passwordHint) || null;

    if (!passwordHint) {
      return null;
    }

    return (
      <div className={styles.passwordHint}>
        <FormattedMessage
          id="signer.txPendingConfirm.passwordHint"
          defaultMessage="(hint) {passwordHint}"
          values={{
            passwordHint
          }}
        />
      </div>
    );
  }
}

export default ConfirmViaPassword;
