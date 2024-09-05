import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from 'react-native';

function TabBar({ state, descriptors, navigation }:{state:any, descriptors:any, navigation:any}) {

    const primaryColor = '#0891b2';
    const greyColor = '#737373';

  return (
    <View style={styles.tabContainer}>
        <View style={styles.tabbar}>
        {state.routes.map((route:any, index:any) => {
        const { options } = descriptors[route.key];
        const label =
            options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
            const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
            }
        };

        const onLongPress = () => {
            navigation.emit({
            type: 'tabLongPress',
            target: route.key,
            });
        };

        return (
            <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
            >
            <Text style={{ color: isFocused ? primaryColor : greyColor }}>
                {label}
            </Text>
            </TouchableOpacity>
        );
        })}
    </View>
  </View>
  )
}

const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
        borderTopEndRadius: 20,
    },
    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 10,
        backgroundColor: 'white',
    },
    tabContainer: {
        flex: 1/10,
        justifyContent: 'center',
        backgroundColor: 'cyan',
        alignItems: 'center',
        borderTopEndRadius: 20,
        borderTopLeftRadius: 20,
    }
})

export default TabBar