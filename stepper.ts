import { ChatInputCommandInteraction, CacheType, Interaction, CollectedInteraction } from "discord.js"

export type Message = Parameters<ChatInputCommandInteraction<CacheType>['reply']>[number]
export type Mathcer = ((i: CollectedInteraction<CacheType>) => boolean)
export type Step = {
    message: Message,
    matchers?: {
        case: string | Mathcer,
        execute: () => Promise<Step> | Step | void
    }[]
}
export const stepper = async (interaction: ChatInputCommandInteraction<CacheType>, option: Step, _isEntrance = true) => {
    const message = await (async () => {
        if (_isEntrance) {
            return interaction.reply(option.message)
        }
        return interaction.editReply(option.message)
    })()
    if ((option.matchers?.length ?? 0) === 0) return
    const collector = message.createMessageComponentCollector();
    collector.on("collect", (i) => {
        option.matchers?.some((mathcer) => {
            const checker: Mathcer = typeof mathcer.case === 'string' ? (x) => x.customId === mathcer.case : mathcer.case
            const matched = checker(i)
            if (!matched) return false;
            i.update({ components: [] }); // 重要！不清空components会导致Discord一直等待回应从而导致失败
            (async () => {
                const step = await mathcer.execute()
                if (step !== undefined) {
                    stepper(interaction, step, false)
                }
            })();
            return true
        });
        collector.stop();
    })

}