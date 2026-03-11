OUTPUT_PATH = '/tmp/e9cf4d55-1aa1-4107-961a-96a135259c24.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Wall Dimensions: 14'6" (Width) x 9' (Height)
    Opening Dimensions: 7' (Width) x 8' (Height) located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters (Blender default unit is meters)
    FT_TO_M = 0.3048

    # Wall dimensions from image:
    # Total Width = 7' (left section) + 7'6" (right section) = 14.5 feet
    # Total Height = 9 feet
    wall_width = 14.5 * FT_TO_M
    wall_height = 9.0 * FT_TO_M
    wall_depth = 0.15  # Standard wall thickness (~6 inches)

    # Opening dimensions (Door/AC frame area):
    # Width = 7 feet
    # Height = 8 feet (leaving 1 foot gap to the 9 foot ceiling)
    opening_width = 7.0 * FT_TO_M
    opening_height = 8.0 * FT_TO_M
    opening_depth = 0.3  # Thicker than wall to ensure a clean boolean cut

    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.dimensions = (wall_width, wall_depth, wall_height)
    # Position so the bottom-left corner of the wall is at the origin (0,0,0)
    wall.location = (wall_width / 2, 0, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Door/Window area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Structural_Opening"
    opening.dimensions = (opening_width, opening_depth, opening_height)
    # Position at the bottom-left of the wall
    opening.location = (opening_width / 2, 0, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Subtract the opening from the wall using a Boolean modifier
    bool_mod = wall.modifiers.new(name="Wall_Cutout", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the helper opening object
    bpy.data.objects.remove(opening, do_unlink=True)

    # 5. Export the final skeleton to GLB format
    # use_selection=False ensures the entire scene (the wall) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/e9cf4d55-1aa1-4107-961a-96a135259c24.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the reconstruction
create_wall_skeleton()