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
import { observer } from 'mobx-react';
import stores from '@parity/mobx';
import IdentityIcon from '@parity/ui/lib/IdentityIcon';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Input from 'semantic-ui-react/dist/commonjs/elements/Input';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import pick from 'lodash/pick';

import styles from './ConfirmViaPassword.css';

@observer
@injectIntl
class ConfirmViaPassword extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired
  };

  static propTypes = {
    address: PropTypes.string.isRequired,
    intl: intlShape,
    isDisabled: PropTypes.bool,
    isFocused: PropTypes.bool,
    request: PropTypes.object.isRequired,
    transaction: PropTypes.object
  };

  state = {
    isSending: false,
    password: '',
    passwordError: null
  };

  allAccountsInfoStore = stores.parity.allAccountsInfo().get(this.context.api);

  handleChange = ({ target: { value } }) =>
    this.setState({
      password: value
    });

  handleConfirm = () => {
    const { api } = this.context;
    const { request, transaction } = this.props;
    const { password } = this.state;

    this.setState({ isSending: true });

    // Note that transaction can be null, in this case confirmRequest will
    // sign the message that was initially in the request
    return api.signer
      .confirmRequest(request.id, pick(transaction, ['condition', 'gas', 'gasPrice']), password)
      .then(() => this.setState({ isSending: false }))
      .catch(error => this.setState({ isSending: false, passwordError: error.text }));
  };

  render () {
    const { address, isDisabled } = this.props;
    const { isSending } = this.state;

    return (
      <div className={styles.confirmForm}>
        <Form>
          {this.renderPassword()}
          {this.renderHint()}
          {this.renderError()}
          <Button
            className={styles.confirmButton}
            content={
              isSending ? (
                <FormattedMessage id='signer.txPendingConfirm.buttons.confirmBusy' defaultMessage='Confirming...' />
              ) : (
                <FormattedMessage
                  id='signer.txPendingConfirm.buttons.confirmRequest'
                  defaultMessage='Confirm Request'
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

  renderError () {
    const { passwordError } = this.state;

    return <div className={styles.error}>{passwordError}</div>;
  }

  renderPassword () {
    const { intl: { formatMessage }, isFocused } = this.props;
    const { password, passwordError } = this.state;

    return (
      <div>
        <label>
          <FormattedMessage id='signer.txPendingConfirm.password.unlock.label' defaultMessage='Account Password:' />
        </label>
        <Input
          className={styles.passwordInput}
          error={!!passwordError}
          focus={isFocused}
          onChange={this.handleChange}
          placeholder={formatMessage({
            defaultMessage: 'unlock the account',
            id: 'signer.txPendingConfirm.password.unlock.hint'
          })}
          type='password'
          value={password}
        />
      </div>
    );
  }

  renderHint () {
    const { address } = this.props;
    const account = this.allAccountsInfoStore.allAccountsInfo[address];
    const passwordHint = (account && account.meta && account.meta.passwordHint) || null;

    if (!passwordHint) {
      return null;
    }

    return (
      <div className={styles.passwordHint}>
        <FormattedMessage
          id='signer.txPendingConfirm.passwordHint'
          defaultMessage='(hint) {passwordHint}'
          values={{
            passwordHint
          }}
        />
      </div>
    );
  }
}

export default ConfirmViaPassword;
