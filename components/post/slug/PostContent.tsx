import React from 'react';
import { View, useWindowDimensions, Linking } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Post } from '@/context/PostsContext';
import { tagsStyles, classesStyles } from '@/app/constants';
interface PostContentProps {
  post: Post;
}


export function PostContent({ post }: PostContentProps) {
  const { width } = useWindowDimensions();
  const htmlContent = post.content || '';

  return (
    <View className="px-6 py-4">
      <RenderHTML
        contentWidth={width - 48}
        source={{ html: htmlContent }}
        tagsStyles={tagsStyles}
        classesStyles={classesStyles}
        defaultTextProps={{
          selectable: true, // Permite selecionar e copiar texto
        }}
        enableExperimentalMarginCollapsing={true}
        renderersProps={{
          a: {
            onPress: (event, href) => {
              // Abre links externos no navegador
              if (href) {
                Linking.openURL(href).catch(err => 
                  console.error('Erro ao abrir link:', err)
                );
              }
            },
          },
          img: {
            enableExperimentalPercentWidth: true,
          },
        }}
      />
      <View className="w-full h-px bg-gray-100 mt-6" />
    </View>
  );
}