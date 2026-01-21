import { Icon, MenuBarExtra } from '@raycast/api';

export default function MenuBarCommand() {
  return (
    <MenuBarExtra icon={Icon.CheckCircle}>
      <MenuBarExtra.Item key="1" title="abc" />
    </MenuBarExtra>
  );
}
