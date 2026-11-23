import { useTranslation } from 'react-i18next'

/** The Elementis card: the starting point of the game, it can be moved by the powers, but it neither scores nor links (F14). */
export const ElementisCardHelp = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2>{t('help.elementis.title')}</h2>
      <p>{t('help.elementis.start')}</p>
      <p>{t('help.elementis.move')}</p>
      <p>{t('help.elementis.score')}</p>
    </>
  )
}
