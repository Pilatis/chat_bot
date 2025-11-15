import { Avatar, AvatarGroup } from '@chakra-ui/react';

interface AvatarComponentProps {
  name: string;
  size: string;
}

export const AvatarComponent = ({ name, size }: AvatarComponentProps) => {
  return (
    <AvatarGroup>
      <Avatar.Root variant="solid">
        <Avatar.Fallback>{name?.charAt(0) || ''}</Avatar.Fallback>
      </Avatar.Root>
    </AvatarGroup>
  );
};
