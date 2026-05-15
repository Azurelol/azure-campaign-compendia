export class AzureCampaignCompendia {

    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     *
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
     */
    static logIf(force, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.moduleId);

        if (shouldLog) {
            console.log(this.moduleId, '|', ...args);
        }
    }

    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     *
     * @param  {...any} args - what to log
     */
    static log(...args) {
        this.logIf(true, args)
    }
}
