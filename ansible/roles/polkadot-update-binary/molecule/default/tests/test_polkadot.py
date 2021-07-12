def test_polkadot_user(host):
    user = host.user('polkadot')
    assert user.exists

    group = host.group('polkadot')
    assert group.exists

    assert user.gid == group.gid


def test_collator_binary(host):
    binary = host.file('/usr/local/bin/polkadot')
    assert binary.exists
    assert binary.user == 'polkadot'
    assert binary.group == 'polkadot'
    assert binary.mode == 0o755


def test_polkadot_service_file(host):
    if host.ansible.get_variables()['inventory_hostname'] == 'collator':
        svc = host.file('/etc/systemd/system/collator.service')
        assert svc.exists


def test_polkadot_running_and_enabled(host):
    if host.ansible.get_variables()['inventory_hostname'] == 'collator':
        polkadot = host.service("collator.service")
        assert polkadot.is_running
