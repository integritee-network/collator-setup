const path = require('path');

const cmd = require('../cmd');
const { Project } = require('../project');
const tpl = require('../tpl');
const { nginxUsername, nginxPassword } = require('../env');

const inventoryFileName = 'inventory'


class Ansible {
  constructor(cfg) {
    this.config = JSON.parse(JSON.stringify(cfg));
    this.ansiblePath = path.join(__dirname, '..', '..', '..', 'ansible');
    this.options = {
      cwd: this.ansiblePath,
      verbose: true
    };
  }

  async runCommonPlaybook(playbookName) {
    const inventoryPath = this._writeInventory();
    return this._cmd(`${playbookName} -f 30 -i "${inventoryPath}"`);
  }

  async clean() {

  }

  async _cmd(command, options = {}) {
    const actualOptions = Object.assign({}, this.options, options);
    return cmd.exec(`ansible-playbook ${command}`, actualOptions);
  }

  _writeInventory() {
    const origin = path.resolve(__dirname, '..', '..', '..', 'tpl', 'ansible_inventory');
    const project = new Project(this.config);
    const buildDir = path.join(project.path(), 'ansible');
    const target = path.join(buildDir, inventoryFileName);

    const collators = this._genTplNodes(this.config.collators);
    const collatorTelemetryUrl = this.config.collators.telemetryUrl;
    const collatorLoggingFilter = this.config.collators.loggingFilter;
    const parachainAdditionalCollatorFlags = this.config.collators.additionalFlags;

    let publicNodes = [];
    let publicTelemetryUrl = '';
    let publicLoggingFilter='';
    let parachainAdditionalPublicFlags = '';
    if (this.config.publicNodes) {
      publicNodes = this._genTplNodes(this.config.publicNodes, collators.length);
      publicTelemetryUrl = this.config.publicNodes.telemetryUrl;
      publicLoggingFilter = this.config.publicNodes.loggingFilter;
      parachainAdditionalPublicFlags = this.config.publicNodes.additionalFlags;
    }

    const data = {
      project: this.config.project,

      collatorBinaryUrl: this.config.collatorBinary.url,
      collatorBinaryChecksum: this.config.collatorBinary.checksum,
      parachain: this.config.parachain || 'statemine',
      relaychain: this.config.relaychain || 'kusama',
      parachainNetworkId: this.config.parachainNetworkId || 'statemine',

      collators,
      publicNodes,

      collatorTelemetryUrl,
      publicTelemetryUrl,

      collatorLoggingFilter,
      publicLoggingFilter,

      buildDir,

      parachainAdditionalCommonFlags: this.config.additionalFlags,
      parachainAdditionalCollatorFlags,
      parachainAdditionalPublicFlags,

      nginxUsername: nginxUsername,
      nginxPassword: nginxPassword
    };

    if (this.config.nodeExporter?.enabled) {
      data.nodeExporterEnabled = true;
      data.nodeExporterBinaryUrl = this.config.nodeExporter.binary.url;
      data.nodeExporterBinaryChecksum = this.config.nodeExporter.binary.checksum;
    } else {
      data.nodeExporterEnabled = false;
    }

    if (this.config.polkadotRestart?.enabled) {
      data.polkadotRestartEnabled = true;
      data.polkadotRestartMinute = this.config.polkadotRestart.minute || '*';
      data.polkadotRestartHour = this.config.polkadotRestart.hour || '*';
      data.polkadotRestartDay = this.config.polkadotRestart.day || '*';
      data.polkadotRestartMonth = this.config.polkadotRestart.month || '*';
      data.polkadotRestartWeekDay = this.config.polkadotRestart.weekDay || '*';
    } else {
      data.polkadotRestartEnabled = false;
    }

    if(this.config.collators.dbSnapshot?.url != undefined && this.config.collators.dbSnapshot?.checksum != undefined){
      data.dbSnapshotUrl = this.config.collators.dbSnapshot.url;
      data.dbSnapshotChecksum = this.config.collators.dbSnapshot.checksum;
    }

    console.log(`[Ansible] Origin: ${JSON.stringify(origin, null, 2)}`)
    console.log(`[Ansible] Target: ${JSON.stringify(target, null, 2)}`)
    console.log(`[Ansible] Data: ${JSON.stringify(data, null, 2)}`)

    tpl.create(origin, target, data);

    return target;
  }

  _genTplNodes(nodeSet, offset=0) {
    const output = [];
    const vpnAddressBase = '10.0.0';
    let counter = offset;

    nodeSet.nodes.forEach((node) => {
      node.ipAddresses.forEach((ipAddress) => {
        counter++;
        const item = {
          ipAddress,
          sshUser: node.sshUser,
          vpnAddress: `${vpnAddressBase}.${counter}`,
        };
        if(node.nodeName){
          item.nodeName=node.nodeName
        }
        output.push(item);
      });
    });
    return output;
  }
}

module.exports = {
  Ansible
}
