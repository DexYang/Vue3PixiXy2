import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type IAccount, useAccountStorage } from '~/storage/account'

interface IAccountState extends IAccount {
    primary: string
}

export const useAccountState = defineStore('account', () => {
    // 本地player索引
    const accountState = ref<IAccountState>({
        account: '',
        players: {},
        primary: ''
    })

    const login = async (account: string) => {
        const storage = useAccountStorage(account)
        accountState.value.account = account

        let id: keyof IAccount['players']
        for (id in storage.value.players) {
            const data = storage.value.players[id]
            data.key = `${account}/${id}`

            if (accountState.value.primary === '')
                accountState.value.primary = data.key

            accountState.value.players[data.key] = data
        }
    }

    const primary = computed({
        set: (primary: string) => accountState.value!.primary = primary,
        get: () => accountState.value!.primary
    })

    return {
        accountState,
        primary,
        login
    }
})
