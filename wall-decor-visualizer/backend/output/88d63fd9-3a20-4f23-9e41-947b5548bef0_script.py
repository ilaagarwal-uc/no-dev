OUTPUT_PATH = '/tmp/88d63fd9-3a20-4f23-9e41-947b5548bef0.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Wall Dimensions: 14'6" (Width) x 9' (Height)
    Opening (Door/AC): 7' (Width) x 8' (Height) located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters (Blender default unit is meters)
    ft_to_m = 0.3048

    # Dimensions extracted from the image:
    # Total Width = 7' (left section) + 7'6" (right section) = 14.5 feet
    # Total Height = 9 feet (confirmed by 8' door + 1' gap)
    # Opening Width = 7 feet
    # Opening Height = 8 feet
    
    wall_width_m = 14.5 * ft_to_m
    wall_height_m = 9.0 * ft_to_m
    wall_thickness_m = 0.15  # Standard wall thickness (~6 inches)
    
    opening_width_m = 7.0 * ft_to_m
    opening_height_m = 8.0 * ft_to_m

    # 1. Create the Main Wall Mesh
    # We create a cube and scale/position it so the bottom-left-front corner is at (0,0,0)
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall_Skeleton"
    wall.scale = (wall_width_m, wall_thickness_m, wall_height_m)
    wall.location = (wall_width_m / 2, wall_thickness_m / 2, wall_height_m / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Cutter for Door/AC area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening_cutter = bpy.context.active_object
    opening_cutter.name = "Opening_Cutter"
    # Scale cutter slightly larger on the Y axis to ensure a clean boolean cut
    opening_cutter.scale = (opening_width_m, wall_thickness_m * 2, opening_height_m)
    opening_cutter.location = (opening_width_m / 2, wall_thickness_m / 2, opening_height_m / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Operation to create the opening in the wall
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = opening_cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the cutter object
    bpy.data.objects.remove(opening_cutter, do_unlink=True)

    # 5. Export the result to GLB format
    # The file will be saved in the current working directory
    output_filename = "wall_skeleton.glb"
    bpy.ops.export_scene.gltf(
        filepath=output_filename,
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly as requested
create_wall_skeleton()